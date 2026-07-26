/**
 * Dual Font Engine: Mangal Devanagari Unicode & KrutiDev 010 Auto-Detector & Police Dictionary Sanitizer
 */

const krutiDevArray = [
  "ñ", "Q+", "q+", "yk+", "y+", "j+", "r+", "s+", "t+", "k+", "n+", "o+", "b+", "m+", "i+", "A+", "µ",
  "à", "á", "â", "ä", "å", "æ", "ç", "è", "é", "ê", "ë", "ì", "í", "î", "ï", "ð", "ñ", "ò", "ó", "ô", "õ", "ö", "÷",
  "ø", "ù", "ú", "û", "ü", "ý", "þ", "ÿ",
  "ñ", "Q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]",
  "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'",
  "z", "x", "c", "v", "b", "n", "m", ",", ".", "/",
  "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "{", "}",
  "A", "S", "D", "F", "G", "H", "J", "K", "L", ":", "\"",
  "Z", "X", "C", "V", "B", "N", "M", "<", ">", "?",
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
]

const unicodeArray = [
  "ऽ", "फ़", "क़", "ख़", "ग़", "ज़", "ड़", "ढ़", "फ़", "क", "न", "य", "ब", "म", "इ", "अ", "मं",
  "्र", "रू", "रू", "हृ", "द्व", "द्य", "द्घ", "द्ब", "द्ध", "द्द", "ट्ट", "ट्ठ", "ड्डे", "ड्ढ", "ह्न", "ह्य", "हृ", "ह्म", "ह्ल", "ह्व", "्", "्", "्", "्",
  "्", "्", "्", "्", "्", "्", "्", "्",
  "ऽ", "ु", "ू", "ा", "ी", "ी", "ब", "ह", "ग", "द", "ज", "ड", "़",
  "ं", "े", "क्", "ि", "ह", "ी", "र", "ा", "स", "य", "श्",
  "्र", "ग", "ब", "त", "इ", "द", "म", "्", "्", "्",
  "फ", "ू", "ा", "ी", "ी", "ब", "ह", "ग", "द", "ज", "ड", "़",
  "ं", "े", "क्", "ि", "ह", "ी", "र", "ा", "स", "य", "श्",
  "्र", "ग", "ब", "त", "इ", "द", "म", "्", "्", "्",
  "०", "१", "२", "३", "४", "५", "६", "७", "८", "९"
]

// Common UP Police Official Dictionary Replacements
const POLICE_VOCAB_REPAIRS: Record<string, string> = {
  'सम्बन्ध': 'संबंध',
  'निर्माणाधीन': 'निर्माणाधीन',
  'प्रयोगशालाओं': 'प्रयोगशालाओं',
  'कार्यदायी': 'कार्यदायी',
  'सूचनार्ड': 'सूचनार्थ',
  'सूचनार्ड्': 'सूचनार्थ',
  'समीक्षा': 'समीक्षा',
  'उपलब्ध': 'उपलब्ध',
  'भूमि': 'भूमि',
  'कब्जा': 'कब्ज़ा',
  'प्रगति': 'प्रगति',
  'कार्रवाही': 'कार्यवाही'
}

/**
 * Dual Font Processor:
 * Auto-detects if input text is Mangal Unicode or KrutiDev 010.
 * Preserves Mangal text cleanly without corrupting Devanagari characters!
 */
export function processDualFontHindiText(inputText: string): { cleanText: string; detectedFont: 'Mangal Unicode' | 'KrutiDev 010' } {
  if (!inputText) return { cleanText: '', detectedFont: 'Mangal Unicode' }

  const text = inputText.trim()

  // Count Devanagari Unicode characters (\u0900-\u097F) vs ASCII letters
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length
  const asciiCount = (text.match(/[a-zA-Z]/g) || []).length

  // If Devanagari count is dominant, it is ALREADY MANGAL UNICODE!
  if (devanagariCount > asciiCount || /[vkj{kh|fujh{kd|Fkkuk|vijk/k]/.test(text) === false) {
    if (devanagariCount > 5) {
      const sanitizedMangal = sanitizeHindiOcrText(text)
      return { cleanText: repairPoliceVocabulary(sanitizedMangal), detectedFont: 'Mangal Unicode' }
    }
  }

  // Otherwise convert KrutiDev 010 ASCII to Unicode
  const converted = convertKrutiDevToUnicode(text)
  return { cleanText: repairPoliceVocabulary(converted), detectedFont: 'KrutiDev 010' }
}

export function convertKrutiDevToUnicode(inputText: string): string {
  if (!inputText) return ''

  let text = inputText

  const wordMap: Record<string, string> = {
    'vkj{kh': 'आरक्षी',
    'fujh{kd': 'निरीक्षक',
    'Fkkuk': 'थाना',
    'vijk/k': 'अपराध',
    'lsok': 'सेवा',
    'ee': 'में',
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
    'i=': 'पत्र',
    'fo"k;': 'विषय',
    'v;ks/;k': 'अयोध्या',
    'tuji': 'जनपद'
  }

  Object.entries(wordMap).forEach(([kWord, uWord]) => {
    const reg = new RegExp(kWord, 'g')
    text = text.replace(reg, uWord)
  })

  text = text.replace(/f([\u0900-\u097F])/g, '$1ि')
  text = text.replace(/f([a-zA-Z])/g, '$1ि')

  let modifiedText = ''
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const idx = krutiDevArray.indexOf(char)
    if (idx !== -1 && unicodeArray[idx]) {
      modifiedText += unicodeArray[idx]
    } else {
      modifiedText += char
    }
  }

  return sanitizeHindiOcrText(modifiedText)
}

/**
 * Smart Hindi Devanagari OCR Text Sanitizer
 */
export function sanitizeHindiOcrText(rawText: string): string {
  if (!rawText) return ''

  let text = rawText

  // 1. Remove weird ASCII noise & isolated non-Devanagari symbols
  text = text.replace(/[♀♂=!|~^{}_+*#@$%&\/\\<>?`"']/g, ' ')

  // 2. Remove standalone unattached matras & isolated nuktas
  text = text.replace(/़[ािीुूृेैोौंःँॅॉॆ०-९]*[क-ह]?/g, ' ')
  text = text.replace(/(^|\s)[़्िीुूृेैोौंःँॅॉॆ]+(\s|$)/g, ' ')

  // 3. Remove isolated single noise characters at start (e.g. "गू", "इब", "तूम", "ले") if followed by valid Hindi
  const words = text.split(/\s+/).filter((w) => w.trim().length > 0)
  
  // Find index of first meaningful Devanagari word (e.g., 'निर्माण', 'कार्य', 'प्रयोगशाला', 'विधि', 'सम्बन्ध', 'कार्यालय')
  const meaningfulIdx = words.findIndex((w) => 
    w.includes('निर्माण') || 
    w.includes('कार्य') || 
    w.includes('प्रयोगशाला') || 
    w.includes('विधि') || 
    w.includes('सम्बन्ध') || 
    w.includes('संबंध') || 
    w.includes('प्रगति') || 
    w.includes('कार्यालय') || 
    w.includes('पुलिस') || 
    w.includes('थाना') ||
    w.includes('हेतु') ||
    w.includes('पत्र') ||
    w.includes('समीक्षा')
  )

  const cleanWords = (meaningfulIdx !== -1 && meaningfulIdx > 0 && meaningfulIdx < 5) 
    ? words.slice(meaningfulIdx) 
    : words

  let cleaned = cleanWords.join(' ').replace(/\s+/g, ' ').trim()
  cleaned = cleaned.replace(/^[^अ-हA-Za-z]+/, '').trim()

  return cleaned
}

/**
 * Repair common UP Police OCR spelling typos using dictionary
 */
export function repairPoliceVocabulary(text: string): string {
  if (!text) return ''
  let repaired = text
  Object.entries(POLICE_VOCAB_REPAIRS).forEach(([bad, good]) => {
    const reg = new RegExp(bad, 'g')
    repaired = repaired.replace(reg, good)
  })
  return repaired
}

/**
 * Extract Official Police Subject Sentence
 */
export function extractSmartHindiSubjectSentence(ocrText: string): string {
  if (!ocrText) return ''

  // Look for exact Subject pattern with 'सम्बन्ध में' / 'संबंध में' / 'समीक्षा के संबंध'
  const matchSubj = ocrText.match(/([अ-ह\s\d\-,\(\)]+(?:के सम्बन्ध में|के संबंध में|समीक्षा के संबंध|के विषय में|कार्रवाही हेतु|हेतु प्रेषित))/i)

  if (matchSubj && matchSubj[1]) {
    let cleanSubj = matchSubj[1].replace(/^[^\u0900-\u097F]+/, '').trim()
    const words = cleanSubj.split(/\s+/)
    if (words.length > 20) {
      cleanSubj = words.slice(-20).join(' ')
    }
    return `विषय: ${cleanSubj}`
  }

  // Fallback: Filter first 15 valid Devanagari words
  const validDevanagariWords = ocrText
    .split(/\s+/)
    .filter((w) => /[\u0900-\u097F]/.test(w) && w.length >= 2)

  if (validDevanagariWords.length > 0) {
    const cleanSubjectText = validDevanagariWords.slice(0, 15).join(' ')
    return `विषय: ${cleanSubjectText} - (आवश्यक कार्यवाही हेतु)`
  }

  return 'विषय: उत्तर प्रदेश पुलिस पत्राचार डांक संदर्भ।'
}
