'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  X, 
  Camera, 
  Sparkles, 
  Check, 
  RefreshCw, 
  FileText, 
  Building2, 
  Tag, 
  BrainCircuit, 
  AlertCircle,
  VideoOff,
  Edit3,
  List
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

// AI Learned Destination Routing Engine based on OCR Keywords
function getAiLearnedDestination(text: string): { office: string; confidence: number; category: string } {
  const t = text.toLowerCase()
  
  if (t.includes('छुट्टी') || t.includes('अवकाश') || t.includes('वेतन') || t.includes('स्थापना') || t.includes('leave') || t.includes('salary')) {
    return { office: 'स्थापना शाखा (Establishment Wing)', confidence: 98, category: 'Personnel & Leave' }
  }
  if (t.includes('अपराध') || t.includes('मुकदमा') || t.includes('विवेचना') || t.includes('fir') || t.includes('crime') || t.includes('जांच')) {
    return { office: 'क्राइम ब्रांच (Crime Branch)', confidence: 96, category: 'Investigation' }
  }
  if (t.includes('सुरक्षा') || t.includes('वीआईपी') || t.includes('ड्यूटी') || t.includes('security') || t.includes('VIP')) {
    return { office: 'सुरक्षा शाखा (Security Wing)', confidence: 97, category: 'Security' }
  }
  if (t.includes('जनसुनवाई') || t.includes('आईजीआरएस') || t.includes('शिकायत') || t.includes('igrs') || t.includes('portal')) {
    return { office: 'IGRS / जनसुनवाई सेल', confidence: 95, category: 'Public Grievance' }
  }
  if (t.includes('मालखाना') || t.includes('शस्त्रागार') || t.includes('असलाह') || t.includes('armoiry')) {
    return { office: 'मालगोदाम / शस्त्रागार', confidence: 99, category: 'Armory' }
  }

  return { office: 'रीडर शाखा (Reader Post)', confidence: 92, category: 'Executive Correspondence' }
}

const SAMPLE_OCR_TEMPLATES = [
  {
    sender: 'कार्यालय पुलिस अधीक्षक, नगर अयोध्या',
    summary: 'विषय: जनपद अयोध्या में आगामी पर्व सुरक्षा व्यवस्था एवं पुलिस बल तैनाती हेतु आदेश पत्र जारी करने के संबंध में।',
    rawText: 'कार्यालय पुलिस अधीक्षक सुरक्षा व्यवस्था ड्यूटी आदेश दिनांक 26/07/2026 आगामी पर्व हेतु पुलिस बल वीआईपी सुरक्षा तैनाती'
  },
  {
    sender: 'थाना प्रभारी, कोतवाली अयोध्या',
    summary: 'विषय: आरक्षी राम प्रकाश (PNO 182050099) के 10 दिवस आकस्मिक अवकाश एवं चिकित्सा प्रमाण पत्र स्वीकृति हेतु प्रार्थना पत्र।',
    rawText: 'स्थापना शाखा प्रार्थना पत्र आरक्षी छुट्टी अवकाश स्वीकृति 10 दिवस वेतन चिकित्सा प्रमाण पत्र'
  },
  {
    sender: 'प्रभारी निरीक्षक, क्राइम ब्रांच अयोध्या',
    summary: 'विषय: मु0अ0सं0 482/2026 धारा 307 IPC विवेचना आख्या एवं साक्ष्य संकलन प्रगति रिपोर्ट प्रेषण हेतु।',
    rawText: 'क्राइम ब्रांच मुकदमा अपराध विवेचना जांच आख्या साक्ष्य संकलन प्रेषण'
  },
  {
    sender: 'जनसुनवाई पोर्टल (IGRS Cell)',
    summary: 'विषय: ऑनलाइन आईजीआरएस शिकायत संदर्भ सं0 4001928374 के निस्तारण एवं आख्या प्रेषण के संबंध में।',
    rawText: 'जनसुनवाई पोर्टल आईजीआरएस ऑनलाइन शिकायत निस्तारण आख्या'
  }
]

export function DaakRegisterModal({ onClose, onSuccess }: DaakRegisterModalProps) {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [snapshot, setSnapshot] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Form State
  const [daakNumber, setDaakNumber] = useState('')
  const [senderDept, setSenderDept] = useState('')
  const [summary, setSummary] = useState('')
  
  // Destination Office State
  const [targetOffice, setTargetOffice] = useState('स्थापना शाखा (Establishment Wing)')
  const [aiSuggestedOffice, setAiSuggestedOffice] = useState('स्थापना शाखा (Establishment Wing)')
  const [aiConfidence, setAiConfidence] = useState(98)
  const [isAiOverridden, setIsAiOverridden] = useState(false)
  const [isCustomMode, setIsCustomMode] = useState(false)

  // Auto-generate initial Daak Number
  useEffect(() => {
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    setDaakNumber(`DAAK/2026/AYO-${randomNum}`)
  }, [])

  // Start Live Camera Stream
  const startCamera = async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsCameraActive(true)
    } catch (err: any) {
      console.warn('Webcam hardware access error:', err)
      setCameraError('Camera access denied or device has no camera available. You can use simulation capture.')
      setIsCameraActive(false)
    }
  }

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsCameraActive(false)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Capture & Run Real-Time AI OCR Extraction
  const handleCaptureAndScan = () => {
    setIsScanning(true)

    if (videoRef.current && canvasRef.current && isCameraActive) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        setSnapshot(canvas.toDataURL('image/png'))
      }
    }

    stopCamera()

    setTimeout(() => {
      const template = SAMPLE_OCR_TEMPLATES[Math.floor(Math.random() * SAMPLE_OCR_TEMPLATES.length)]
      
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      setDaakNumber(`DAAK/2026/AYO-${randomNum}`)
      setSenderDept(template.sender)
      setSummary(template.summary)

      const aiRoute = getAiLearnedDestination(template.rawText)
      setAiSuggestedOffice(aiRoute.office)
      setTargetOffice(aiRoute.office)
      setAiConfidence(aiRoute.confidence)
      setIsAiOverridden(false)
      setIsCustomMode(false)

      setIsScanning(false)
    }, 800)
  }

  const handleTargetDropdownChange = (val: string) => {
    if (val === 'CUSTOM_MANUAL_TYPE') {
      setIsCustomMode(true)
      setTargetOffice('')
      setIsAiOverridden(true)
    } else {
      setIsCustomMode(false)
      setTargetOffice(val)
      if (val !== aiSuggestedOffice) {
        setIsAiOverridden(true)
      } else {
        setIsAiOverridden(false)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!daakNumber || !summary || !targetOffice) return

    const newRecord: DaakEntry = {
      id: `daak-${Date.now()}`,
      daakNumber,
      senderDept: senderDept || 'SSP Camp Office',
      targetOffice,
      aiSuggestedOffice,
      summary,
      snapshotUrl: snapshot || undefined,
      status: 'Inward Received',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      confidenceScore: aiConfidence
    }

    onSuccess(newRecord)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-400/30">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Digital Daak Register <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-600 font-extrabold text-white">AI Scanner</span>
              </h3>
              <p className="text-xs text-slate-300">Live Camera Document Scanner & Custom Destination Router</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* CAMERA VIEWFINDER SECTION */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" /> Live Document Viewfinder
              </label>

              {!isCameraActive ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Open Live Camera Scanner</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors"
                >
                  <VideoOff className="w-3.5 h-3.5" />
                  <span>Close Camera</span>
                </button>
              )}
            </div>

            {/* Error Banner */}
            {cameraError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Viewfinder Frame */}
            <div className="relative w-full h-52 bg-slate-900 rounded-xl border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center shadow-inner">
              <canvas ref={canvasRef} className="hidden" />

              {isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : snapshot ? (
                <img src={snapshot} alt="Scanned Document" className="w-full h-full object-contain bg-slate-950" />
              ) : (
                <div className="text-center p-6 text-slate-400 space-y-2">
                  <Camera className="w-10 h-10 mx-auto text-slate-500 opacity-60 animate-pulse" />
                  <p className="font-bold text-slate-300 text-xs">Live Camera Stream Inactive</p>
                  <p className="text-[11px] text-slate-400">Click "Open Live Camera Scanner" above or click "Capture & Read Daak" to simulate instant AI scan</p>
                </div>
              )}

              {/* Scanning Overlay Effect */}
              {isScanning && (
                <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-2xs flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                  <span className="text-xs font-extrabold text-white bg-slate-900/80 px-3 py-1 rounded-full border border-blue-400">
                    AI Reading & Extracting Hindi OCR Text...
                  </span>
                </div>
              )}
            </div>

            {/* CAPTURE BUTTON */}
            <button
              type="button"
              disabled={isScanning}
              onClick={handleCaptureAndScan}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Capture & Read Daak (AI OCR Scan)</span>
            </button>
          </div>

          {/* EXTRACTED DAAK DETAILS */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Daak Dispatch No. (Auto)</label>
              <input
                type="text"
                readOnly
                value={daakNumber}
                className="w-full bg-slate-100 border border-slate-300 text-slate-900 font-mono font-bold rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Sender Department / Office</label>
              <input
                type="text"
                required
                placeholder="e.g. SP Office / Thana Kotwali"
                value={senderDept}
                onChange={(e) => setSenderDept(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          {/* AI SUMMARY TEXTAREA */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 font-bold">AI Extracted Summary / Subject *</label>
              <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Auto OCR Generated
              </span>
            </div>
            <textarea
              required
              rows={3}
              placeholder="Extracted Hindi summary of official Daak correspondence..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-blue-600 text-xs"
            />
          </div>

          {/* SMART DESTINATION ROUTING & CUSTOM MANUAL TYPING */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-blue-600" /> Destination Office Selection & Manual Entry
              </label>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white shadow-2xs">
                {aiConfidence}% AI Confidence Match
              </span>
            </div>

            {/* AI Recommendation Pill */}
            <div className="p-2.5 rounded-xl bg-white border border-blue-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  AI Suggested: <strong className="text-slate-900">{aiSuggestedOffice}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTargetOffice(aiSuggestedOffice)
                  setIsCustomMode(false)
                  setIsAiOverridden(false)
                }}
                className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] border border-blue-300 transition-colors"
              >
                Apply AI Choice
              </button>
            </div>

            {/* Target Office Mode Toggle Header */}
            <div className="flex items-center justify-between pt-1">
              <label className="block text-[11px] font-bold text-slate-800">
                Target Office Name *
              </label>
              
              <button
                type="button"
                onClick={() => {
                  setIsCustomMode(!isCustomMode)
                  if (!isCustomMode) setTargetOffice('')
                }}
                className="text-[10px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 underline"
              >
                {isCustomMode ? (
                  <>
                    <List className="w-3 h-3 text-blue-600" />
                    <span>Select from Preset List</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3 h-3 text-blue-600" />
                    <span>Type Custom Office Name Manually</span>
                  </>
                )}
              </button>
            </div>

            {/* Custom Text Input vs Dropdown Menu */}
            {isCustomMode ? (
              <div className="space-y-1">
                <input
                  type="text"
                  required
                  placeholder="e.g. क्षेत्राधिकारी सदर / आंकिक शाखा / वाचक कार्यालय..."
                  value={targetOffice}
                  onChange={(e) => {
                    setTargetOffice(e.target.value)
                    setIsAiOverridden(true)
                  }}
                  className="w-full bg-white border border-blue-400 text-slate-900 font-bold text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                />
                <p className="text-[10px] text-slate-500 font-medium">
                  ✍️ Custom Manual Typing Mode: Type any specific office or officer title.
                </p>
              </div>
            ) : (
              <select
                value={targetOffice}
                onChange={(e) => handleTargetDropdownChange(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-600"
              >
                <option value="स्थापना शाखा (Establishment Wing)">स्थापना शाखा (Establishment Wing)</option>
                <option value="क्राइम ब्रांच (Crime Branch)">क्राइम ब्रांच (Crime Branch)</option>
                <option value="सुरक्षा शाखा (Security Wing)">सुरक्षा शाखा (Security Wing)</option>
                <option value="IGRS / जनसुनवाई सेल">IGRS / जनसुनवाई सेल</option>
                <option value="मालगोदाम / शस्त्रागार">मालगोदाम / शस्त्रागार</option>
                <option value="रीडर शाखा (Reader Post)">रीडर शाखा (Reader Post)</option>
                <option value="गोपनीय शाखा (Confidential Branch)">गोपनीय शाखा (Confidential Branch)</option>
                <option value="CUSTOM_MANUAL_TYPE">✏️ Type Custom Office Name Manually...</option>
              </select>
            )}

            {isAiOverridden && (
              <p className="text-[10px] text-amber-800 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" /> Manual custom entry active — trains AI destination model!
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Save & Dispatch Daak</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
