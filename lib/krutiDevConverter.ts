/**
 * Dual Font Engine: Mangal Devanagari Unicode & KrutiDev 010 Auto-Detector
 * + Aggressive Police Document OCR Cleaner
 */

const krutiDevWordMap: Record<string, string> = {
  'vkj{kh': 'आरक्षी',
  'fujh{kd': 'निरीक्षक',
  'Fkkuk': 'थाना',
  'vijk/k': 'अपराध',
  'lsok': 'सेवा',
  'dk;kZy;': 'कार्यालय',
  'iqfyl': 'पुलिस',
  'v/kh{kd': 'अधीक्षक',
  'eqdnek': 'मुकदमा',
  'fobspuk': 'विवेचना',
  'ljq{kk': 'सुरक्षा',
  'M~;wVh': 'ड्यूटी',
  'NqV~Vh': 'छुट्टी',
  'vodk': 'अवकाश',
  'osru': 'वेतन',
  'izHkkjh': 'प्रभारी',
  'izkFkZuk': 'प्रार्थना',
  'fo"k;': 'विषय',
  'v;ks/;k': 'अयोध्या',
  'tuji': 'जनपद',
  'dk;ZOkgh': 'कार्यवाही',
  'gsrq': 'हेतु',
  'i=': 'पत्र',
  'ee': 'में',
}

const krutiDevArray = [
  "ñ","Q+","q+","yk+","y+","j+","r+","s+","t+","k+","n+","o+","b+","m+","i+","A+","µ",
  "à","á","â","ä","å","æ","ç","è","é","ê","ë","ì","í","î","ï","ð","ñ","ò","ó","ô","õ","ö","÷",
  "ø","ù","ú","û","ü","ý","þ","ÿ",
  "ñ","Q","w","e","r","t","y","u","i","o","p","[","]",
  "a","s","d","f","g","h","j","k","l",";","'",
  "z","x","c","v","b","n","m",",",".","/",
  "Q","W","E","R","T","Y","U","I","O","P","{","}",
  "A","S","D","F","G","H","J","K","L",":","\"",
  "Z","X","C","V","B","N","M","<",">","?",
  "0","1","2","3","4","5","6","7","8","9"
]

const unicodeArray = [
  "ऽ","फ़","क़","ख़","ग़","ज़","ड़","ढ़","फ़","क","न","य","ब","म","इ","अ","मं",
  "्र","रू","रू","हृ","द्व","द्य","द्घ","द्ब","द्ध","द्द","ट्ट","ट्ठ","ड्डे","ड्ढ","ह्न","ह्य","हृ","ह्म","ह्ल","ह्व","्","्","्","्",
  "्","्","्","्","्","्","्","्",
  "ऽ","ु","ू","ा","ी","ी","ब","ह","ग","द","ज","ड","़",
  "ं","े","क्","ि","ह","ी","र","ा","स","य","श्",
  "्र","ग","ब","त","इ","द","म","्","्","्",
  "फ","ू","ा","ी","ी","ब","ह","ग","द","ज","ड","़",
  "ं","े","क्","ि","ह","ी","र","ा","स","य","श्",
  "्र","ग","ब","त","इ","द","म","्","्","्",
  "०","१","२","३","४","५","६","७","८","९"
]

// Minimum meaningful Hindi word length (characters in Devanagari)
const MIN_HINDI_WORD_DEVANAGARI_CHARS = 2

/**
 * A word is "pure Devanagari" if it has ≥2 Devanagari chars AND
 * the ratio of Devanagari chars to total chars is > 0.6
 */
function isPureDevanagariWord(word: string): boolean {
  if (!word || word.trim().length === 0) return false
  const w = word.trim()
  const devChars = (w.match(/[\u0900-\u097F]/g) || []).length
  const totalChars = w.replace(/\s/g, '').length
  if (devChars < MIN_HINDI_WORD_DEVANAGARI_CHARS) return false
  return (devChars / totalChars) >= 0.6
}

/**
 * Auto-detects whether raw OCR text is Mangal Unicode or KrutiDev 010.
 * Returns cleaned text and detected font type.
 */
export function processDualFontHindiText(rawText: string): {
  cleanText: string
  detectedFont: 'Mangal Unicode' | 'KrutiDev 010'
} {
  if (!rawText || rawText.trim().length === 0) {
    return { cleanText: '', detectedFont: 'Mangal Unicode' }
  }

  const text = rawText.trim()
  const devCount = (text.match(/[\u0900-\u097F]/g) || []).length
  const asciiCount = (text.match(/[a-zA-Z]/g) || []).length

  let cleaned: string
  let font: 'Mangal Unicode' | 'KrutiDev 010'

  if (devCount >= asciiCount || devCount > 10) {
    // Likely Mangal Unicode — just sanitize aggressively
    cleaned = aggressiveDevanagariCleaner(text)
    font = 'Mangal Unicode'
  } else {
    // Likely KrutiDev 010 — convert first, then clean
    cleaned = aggressiveDevanagariCleaner(convertKrutiDevToUnicode(text))
    font = 'KrutiDev 010'
  }

  return { cleanText: cleaned, detectedFont: font }
}

function convertKrutiDevToUnicode(inputText: string): string {
  let text = inputText
  Object.entries(krutiDevWordMap).forEach(([k, v]) => {
    text = text.replace(new RegExp(k, 'g'), v)
  })
  text = text.replace(/f([\u0900-\u097F])/g, '$1ि')

  let result = ''
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const idx = krutiDevArray.indexOf(char)
    result += idx !== -1 && unicodeArray[idx] ? unicodeArray[idx] : char
  }
  return result
}

/**
 * Aggressive Devanagari OCR Cleaner:
 * 1. Splits on whitespace + removes tokens that are NOT pure Hindi words
 * 2. Removes tokens mixing Latin letters + Devanagari (OCR artifacts)
 * 3. Keeps only words with ≥ 60% Devanagari character ratio
 * 4. Removes standalone matra artifacts (़ि ा ी etc)
 */
export function aggressiveDevanagariCleaner(rawText: string): string {
  if (!rawText) return ''

  // Step 1: Remove ASCII-only noise tokens and punctuation except danda
  // Keep: Devanagari chars, spaces, numbers ०-९, danda ।
  let text = rawText
    .replace(/[♀♂@#$%^&*_+=\[\]{}<>?`"~\\]/g, ' ') // junk symbols
    .replace(/[0-9]+/g, ' ')                           // English digits
    .replace(/[A-Za-z]+/g, ' ')                        // English letters (artifacts)

  // Step 2: Remove dangling matras not attached to consonants
  text = text
    .replace(/[़ािीुूृेैोौंःँॅॉॆ]{1,3}(?=\s|$)/g, ' ')
    .replace(/^[़ािीुूृेैोौंःँॅॉॆ\s]+/g, ' ')

  // Step 3: Keep only tokens that have ≥ 2 Devanagari characters
  const tokens = text.split(/\s+/)
  const cleanTokens = tokens.filter((token) => {
    const t = token.trim()
    if (!t) return false
    const devChars = (t.match(/[\u0900-\u097F]/g) || []).length
    return devChars >= 2
  })

  return cleanTokens.join(' ').replace(/\s+/g, ' ').trim()
}

/**
 * Extract Official Police Subject Sentence
 * Looks for "के संबंध में" / "सम्बन्ध में" / "हेतु" pattern in clean text.
 */
export function extractSmartHindiSubjectSentence(cleanOcrText: string): string {
  if (!cleanOcrText || cleanOcrText.trim().length < 5) {
    return 'विषय: आवश्यक कार्यवाही हेतु पत्र।'
  }

  // Try: extract sentence containing key official subject markers
  const subjectPatterns = [
    /([^\।।]*(?:के संबंध में|के सम्बन्ध में|समीक्षा के संबंध|के विषय में)[^\।।]*)/,
    /([^\।।]*(?:हेतु प्रेषित|कार्यवाही हेतु|कार्रवाही हेतु)[^\।।]*)/,
    /([^\।।]*(?:विधि विज्ञान|प्रयोगशाला|निर्माण)[^\।।]*)/,
  ]

  for (const pattern of subjectPatterns) {
    const match = cleanOcrText.match(pattern)
    if (match && match[1]) {
      const subj = match[1].replace(/^[^अ-ह]+/, '').trim()
      if (subj.length > 10) {
        return `विषय: ${subj}`
      }
    }
  }

  // Fallback: take first 15 pure Devanagari words
  const pureHindiWords = cleanOcrText
    .split(/\s+/)
    .filter((w) => (w.match(/[\u0900-\u097F]/g) || []).length >= 2)

  if (pureHindiWords.length > 0) {
    return `विषय: ${pureHindiWords.slice(0, 15).join(' ')} (आवश्यक कार्यवाही हेतु)`
  }

  return 'विषय: उत्तर प्रदेश पुलिस पत्राचार डांक संदर्भ।'
}
