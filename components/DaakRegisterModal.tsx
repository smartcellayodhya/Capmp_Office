'use client'

import { useState, useRef, useEffect } from 'react'
import Tesseract from 'tesseract.js'
import { processDualFontHindiText, extractSmartHindiSubjectSentence } from '@/lib/krutiDevConverter'
import {
  X, Camera, Sparkles, Check, RefreshCw, Tag, BrainCircuit,
  AlertCircle, VideoOff, Edit3, List, FlipHorizontal, Upload, Languages, ZoomIn
} from 'lucide-react'

interface DaakEntry {
  id: string
  daakNumber: string
  senderDept: string
  targetOffice: string
  aiSuggestedOffice: string
  summary: string
  snapshotUrl?: string
  status: 'Inward Received' | 'Dispatched' | 'Action Pending'
  date: string
  confidenceScore: number
}

interface DaakRegisterModalProps {
  onClose: () => void
  onSuccess: (newEntry: DaakEntry) => void
}

function getAiLearnedDestination(text: string): { office: string; confidence: number } {
  const t = text.toLowerCase()
  if (t.includes('विधि विज्ञान') || t.includes('प्रयोगशाला') || t.includes('फॉरेंसिक')) {
    return { office: 'क्राइम ब्रांच / विधि विज्ञान शाखा', confidence: 99 }
  }
  if (t.includes('छुट्टी') || t.includes('अवकाश') || t.includes('वेतन') || t.includes('स्थापना') || t.includes('आकस्मिक')) {
    return { office: 'स्थापना शाखा (Establishment Wing)', confidence: 98 }
  }
  if (t.includes('अपराध') || t.includes('मुकदमा') || t.includes('विवेचना') || t.includes('जांच') || t.includes('धारा')) {
    return { office: 'क्राइम ब्रांच (Crime Branch)', confidence: 96 }
  }
  if (t.includes('सुरक्षा') || t.includes('ड्यूटी') || t.includes('तयनाती') || t.includes('पर्व') || t.includes('वीआईपी')) {
    return { office: 'सुरक्षा शाखा (Security Wing)', confidence: 97 }
  }
  if (t.includes('जनसुनवाई') || t.includes('शिकायत') || t.includes('ऑनलाइन')) {
    return { office: 'IGRS / जनसुनवाई सेल', confidence: 95 }
  }
  if (t.includes('मालखाना') || t.includes('शस्त्रागार') || t.includes('असलाह')) {
    return { office: 'मालगोदाम / शस्त्रागार', confidence: 99 }
  }
  return { office: 'रीडर शाखा (Reader Post)', confidence: 92 }
}

/**
 * Preprocess image canvas for better OCR accuracy:
 * 1. Convert to grayscale
 * 2. Increase contrast sharply
 * 3. Apply threshold to make text black on white
 */
function preprocessCanvasForOCR(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas.toDataURL('image/png')

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    // Step 1: Grayscale using luminosity formula
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]

    // Step 2: High contrast — push light pixels to white, dark pixels to black
    const contrasted = gray > 128 ? 255 : 0

    data[i] = contrasted
    data[i + 1] = contrasted
    data[i + 2] = contrasted
    // alpha stays the same
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}

export function DaakRegisterModal({ onClose, onSuccess }: DaakRegisterModalProps) {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [ocrProgress, setOcrProgress] = useState('Initializing OCR...')
  const [snapshot, setSnapshot] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [cleanWords, setCleanWords] = useState<string>('')
  const [detectedFontType, setDetectedFontType] = useState<'Mangal Unicode' | 'KrutiDev 010'>('Mangal Unicode')

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [daakNumber, setDaakNumber] = useState('')
  const [senderDept, setSenderDept] = useState('')
  const [summary, setSummary] = useState('')
  const [targetOffice, setTargetOffice] = useState('स्थापना शाखा (Establishment Wing)')
  const [aiSuggestedOffice, setAiSuggestedOffice] = useState('स्थापना शाखा (Establishment Wing)')
  const [aiConfidence, setAiConfidence] = useState(95)
  const [isAiOverridden, setIsAiOverridden] = useState(false)
  const [isCustomMode, setIsCustomMode] = useState(false)

  useEffect(() => {
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    setDaakNumber(`DAAK/2026/AYO-${randomNum}`)
  }, [])

  // HIGH RESOLUTION CAMERA — requests max quality for document OCR
  const startCamera = async (overrideFacing?: 'user' | 'environment') => {
    setCameraError(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera not supported. Please upload document photo.')
      setIsCameraActive(true)
      return
    }
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())

    const mode = overrideFacing || facingMode

    // Request highest possible resolution for document scanning
    const highResConstraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: mode },
        width: { ideal: 3840, min: 1280 },
        height: { ideal: 2160, min: 720 },
        frameRate: { ideal: 30, min: 15 },
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(highResConstraints)
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', 'true')
      }
      setIsCameraActive(true)
    } catch {
      // Fallback to standard HD
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode }, width: { ideal: 1920 }, height: { ideal: 1080 } }
        })
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setIsCameraActive(true)
      } catch {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          streamRef.current = stream
          if (videoRef.current) videoRef.current.srcObject = stream
          setIsCameraActive(true)
        } catch {
          setCameraError('Camera unavailable. Please upload a photo of the document.')
          setIsCameraActive(true)
        }
      }
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setIsCameraActive(false)
  }

  const toggleCameraFacing = () => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(newFacing)
    startCamera(newFacing)
  }

  useEffect(() => () => stopCamera(), [])

  // Run Tesseract OCR on preprocessed image
  const runOCR = async (rawImageDataUrl: string) => {
    setIsScanning(true)
    setCleanWords('')
    setSummary('')
    setSenderDept('')
    setOcrProgress('Preparing image for OCR...')

    try {
      // Step 1: Preprocess image for better OCR quality
      // Load image into a temporary canvas and apply grayscale + high contrast
      const processedDataUrl = await preprocessImageForOCR(rawImageDataUrl)

      setOcrProgress('Running Hindi OCR...')

      const result = await Tesseract.recognize(processedDataUrl, 'hin+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(`Extracting Hindi Text... ${Math.floor(m.progress * 100)}%`)
          }
        }
      })

      const rawOCR = (result.data.text || '').trim()

      // Step 2: Dual font processing + aggressive Devanagari cleaning
      const { cleanText, detectedFont } = processDualFontHindiText(rawOCR)
      setDetectedFontType(detectedFont)
      setCleanWords(cleanText)

      const randomNum = Math.floor(1000 + Math.random() * 9000)
      setDaakNumber(`DAAK/2026/AYO-${randomNum}`)

      if (cleanText.length > 5) {
        setSenderDept(
          cleanText.includes('विधि विज्ञान') ? 'विधि विज्ञान प्रयोगशाला, लखनऊ'
          : cleanText.includes('कार्यालय') ? 'कार्यालय पुलिस अधीक्षक, अयोध्या'
          : 'कार्यालय पुलिस अधीक्षक, अयोध्या'
        )

        const subject = extractSmartHindiSubjectSentence(cleanText)
        setSummary(subject)

        const aiRoute = getAiLearnedDestination(cleanText)
        setAiSuggestedOffice(aiRoute.office)
        setTargetOffice(aiRoute.office)
        setAiConfidence(aiRoute.confidence)
      } else {
        setSenderDept('कार्यालय पुलिस अधीक्षक, अयोध्या')
        setSummary('विषय: (फोटो स्पष्ट नहीं — कृपया मैन्युअल रूप से भरें)')
        setAiSuggestedOffice('रीडर शाखा (Reader Post)')
        setTargetOffice('रीडर शाखा (Reader Post)')
        setAiConfidence(60)
      }
    } catch {
      setSenderDept('कार्यालय पुलिस अधीक्षक, अयोध्या')
      setSummary('विषय: (OCR विफल — कृपया मैन्युअल रूप से भरें)')
    } finally {
      setIsScanning(false)
    }
  }

  // Preprocess image: load into canvas, apply grayscale + high contrast threshold
  const preprocessImageForOCR = (rawDataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        // Scale up small images for better OCR accuracy (min 2000px wide)
        const scale = img.width < 2000 ? Math.min(3, 2000 / img.width) : 1
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(rawDataUrl); return }

        // Draw scaled image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Apply grayscale + high contrast preprocessing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const d = imageData.data

        for (let i = 0; i < d.length; i += 4) {
          // Grayscale using luminosity
          const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
          // High contrast: threshold at 140 (slightly lower to catch light ink)
          const contrasted = gray > 140 ? 255 : 0
          d[i] = contrasted
          d[i + 1] = contrasted
          d[i + 2] = contrasted
        }

        ctx.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => resolve(rawDataUrl)
      img.src = rawDataUrl
    })
  }

  const handleCaptureAndScan = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Capture at actual video resolution (high res)
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/png')
    setSnapshot(dataUrl)
    stopCamera()
    runOCR(dataUrl)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    stopCamera()
    const reader = new FileReader()
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string
      if (dataUrl) { setSnapshot(dataUrl); runOCR(dataUrl) }
    }
    reader.readAsDataURL(file)
  }

  const handleTargetChange = (val: string) => {
    if (val === 'CUSTOM') {
      setIsCustomMode(true); setTargetOffice(''); setIsAiOverridden(true)
    } else {
      setIsCustomMode(false); setTargetOffice(val)
      setIsAiOverridden(val !== aiSuggestedOffice)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!daakNumber || !summary || !targetOffice) return
    onSuccess({
      id: `daak-${Date.now()}`, daakNumber,
      senderDept: senderDept || 'SSP Camp Office',
      targetOffice, aiSuggestedOffice, summary,
      snapshotUrl: snapshot || undefined,
      status: 'Inward Received',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      confidenceScore: aiConfidence
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[94vh]"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-400/30 shrink-0">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                Digital Daak Register
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-blue-600 font-extrabold">AI OCR Engine</span>
              </h3>
              <p className="text-[10px] text-slate-400">HD Camera + Image Enhancement + Dual Font AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-5 space-y-4">

          {/* Camera / Upload Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" /> HD Document Scanner
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs">
                  <Upload className="w-3.5 h-3.5" /> Upload Photo
                </button>
                {isCameraActive && (
                  <button type="button" onClick={toggleCameraFacing}
                    className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700" title="Flip Camera">
                    <FlipHorizontal className="w-3.5 h-3.5" />
                  </button>
                )}
                {!isCameraActive ? (
                  <button type="button" onClick={() => startCamera()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                    <Camera className="w-3.5 h-3.5" /> Open HD Camera
                  </button>
                ) : (
                  <button type="button" onClick={stopCamera}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs">
                    <VideoOff className="w-3.5 h-3.5" /> Close
                  </button>
                )}
              </div>
            </div>

            {cameraError && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /> {cameraError}
              </div>
            )}

            {/* HD Viewfinder — full width, tall enough for document capture */}
            <div className="relative w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-700"
              style={{ aspectRatio: '4/3' }}>
              <canvas ref={canvasRef} className="hidden" />

              {/* HD Video — object-cover fills the frame */}
              <video ref={videoRef} autoPlay playsInline muted
                className={`w-full h-full object-cover ${isCameraActive && streamRef.current ? 'block' : 'hidden'}`}
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              />

              {!isCameraActive && snapshot && (
                <img src={snapshot} alt="Scanned Doc" className="w-full h-full object-contain bg-slate-950" />
              )}

              {!isCameraActive && !snapshot && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 gap-3">
                  <Camera className="w-10 h-10 text-slate-500 animate-pulse" />
                  <div>
                    <p className="text-slate-300 text-xs font-bold">HD Document Camera</p>
                    <p className="text-slate-500 text-[10px] mt-1">Tap "Open HD Camera" — hold phone flat above paper for best scan</p>
                  </div>
                </div>
              )}

              {/* Camera Guidelines overlay when active */}
              {isCameraActive && !isScanning && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Corner guides */}
                  <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-blue-400 rounded-tl-sm" />
                  <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-blue-400 rounded-tr-sm" />
                  <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-blue-400 rounded-bl-sm" />
                  <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-blue-400 rounded-br-sm" />
                  <div className="absolute bottom-2 left-0 right-0 text-center">
                    <span className="text-[10px] text-blue-300 font-bold bg-slate-950/60 px-2 py-0.5 rounded-full">
                      📄 Align document within guides — hold steady
                    </span>
                  </div>
                </div>
              )}

              {/* Scanning Overlay */}
              {isScanning && (
                <div className="absolute inset-0 bg-blue-950/85 flex flex-col items-center justify-center gap-3 p-4">
                  <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                  <span className="text-xs font-extrabold text-white bg-blue-600/90 px-4 py-1.5 rounded-full border border-blue-400">
                    {ocrProgress}
                  </span>
                  <p className="text-[10px] text-blue-200">Grayscale + Contrast enhancement → Hindi OCR...</p>
                </div>
              )}
            </div>

            {/* Capture Button */}
            <button type="button" disabled={isScanning} onClick={handleCaptureAndScan}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 disabled:opacity-50 shadow-md">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Capture & Extract Hindi Text (HD + AI)
            </button>

            {/* Tips */}
            <div className="grid grid-cols-3 gap-1.5 text-[9px] text-slate-500 font-semibold text-center">
              <div className="bg-slate-100 rounded-lg p-1.5">📱 Hold phone flat above paper</div>
              <div className="bg-slate-100 rounded-lg p-1.5">💡 Good lighting needed</div>
              <div className="bg-slate-100 rounded-lg p-1.5">📄 Keep text inside guides</div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">Daak No. (Auto)</label>
              <input readOnly value={daakNumber}
                className="w-full bg-slate-100 border border-slate-300 text-slate-900 font-mono font-bold rounded-xl px-3 py-2 text-xs" />
            </div>
            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">Sender Dept / Office</label>
              <input required placeholder="SP Office / Thana Kotwali..." value={senderDept}
                onChange={e => setSenderDept(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 text-xs" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
              <label className="text-slate-700 font-bold text-xs">Official Subject / Summary *</label>
              {cleanWords.length > 0 && (
                <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <Languages className="w-3 h-3" /> {detectedFontType} Detected
                </span>
              )}
            </div>
            <textarea required rows={3} value={summary} onChange={e => setSummary(e.target.value)}
              placeholder="Auto-extracted from paper photo OR type manually..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 text-xs focus:outline-none focus:border-blue-600" />
          </div>

          {/* Clean Words Preview */}
          {cleanWords.length > 0 && (
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Recognized Hindi Words ({detectedFontType}):
              </p>
              <p className="text-xs text-white font-medium leading-relaxed max-h-16 overflow-y-auto">
                {cleanWords}
              </p>
            </div>
          )}

          {/* AI Routing */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-blue-600" /> Destination Office
              </label>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white">
                {aiConfidence}% AI Match
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-blue-200 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>AI Suggested: <strong>{aiSuggestedOffice}</strong></span>
              </div>
              <button type="button"
                onClick={() => { setTargetOffice(aiSuggestedOffice); setIsCustomMode(false); setIsAiOverridden(false) }}
                className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] border border-blue-300">
                Apply AI Choice
              </button>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="text-[11px] font-bold text-slate-800">Target Office *</label>
              <button type="button" onClick={() => { setIsCustomMode(!isCustomMode); if (!isCustomMode) setTargetOffice('') }}
                className="text-[10px] font-bold text-blue-700 underline flex items-center gap-1">
                {isCustomMode ? <><List className="w-3 h-3" /> Preset List</> : <><Edit3 className="w-3 h-3" /> Type Manually</>}
              </button>
            </div>

            {isCustomMode ? (
              <input required value={targetOffice} onChange={e => { setTargetOffice(e.target.value); setIsAiOverridden(true) }}
                placeholder="e.g. क्षेत्राधिकारी सदर / आंकिक शाखा..."
                className="w-full bg-white border border-blue-400 text-slate-900 font-bold text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            ) : (
              <select value={targetOffice} onChange={e => handleTargetChange(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-600">
                <option value="स्थापना शाखा (Establishment Wing)">स्थापना शाखा (Establishment Wing)</option>
                <option value="क्राइम ब्रांच (Crime Branch)">क्राइम ब्रांच (Crime Branch)</option>
                <option value="क्राइम ब्रांच / विधि विज्ञान शाखा">क्राइम ब्रांच / विधि विज्ञान शाखा</option>
                <option value="सुरक्षा शाखा (Security Wing)">सुरक्षा शाखा (Security Wing)</option>
                <option value="IGRS / जनसुनवाई सेल">IGRS / जनसुनवाई सेल</option>
                <option value="मालगोदाम / शस्त्रागार">मालगोदाम / शस्त्रागार</option>
                <option value="रीडर शाखा (Reader Post)">रीडर शाखा (Reader Post)</option>
                <option value="गोपनीय शाखा (Confidential Branch)">गोपनीय शाखा (Confidential Branch)</option>
                <option value="CUSTOM">✏️ Type Custom Office Manually...</option>
              </select>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-200 flex justify-end gap-3">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300">
              Cancel
            </button>
            <button type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm">
              <Check className="w-4 h-4" /> Save & Dispatch Daak
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
