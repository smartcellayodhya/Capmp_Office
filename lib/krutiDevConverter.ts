/**
 * KrutiDev 010 to Unicode Devanagari Converter Engine & Smart Police Document Subject Extractor
 * Converts legacy KrutiDev 010 / Devlys Hindi font encoding into clean readable Unicode Devanagari.
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

export function convertKrutiDevToUnicode(inputText: string): string {
  if (!inputText) return ''

  let text = inputText

  // Common KrutiDev word replacements in UP Police correspondence
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
 * Strips out noise characters (♀, =, !, |, isolated broken matras) and cleans up OCR output.
 */
export function sanitizeHindiOcrText(rawText: string): string {
  if (!rawText) return ''

  let text = rawText

  // 1. Remove weird ASCII symbols and isolated noise chars: ♀, ♂, =, !, |, ~, ^, {}, _, etc.
  text = text.replace(/[♀♂=!|~^{}_+*#@$%&\/\\<>?`"']/g, ' ')

  // 2. Remove standalone unattached matras & isolated nuktas (e.g. ़ाी, ़ी, ़िू, ़ू, ॆ, ़ंा, ़)
  text = text.replace(/़[ािीुूृेैोौंःँॅॉॆ०-९]*[क-ह]?/g, ' ')
  text = text.replace(/(^|\s)[़्िीुूृेैोौंःँॅॉॆ]+(\s|$)/g, ' ')

  // 3. Remove single isolated random non-Devanagari letter noise
  const cleanWords = text.split(/\s+/).filter((word) => {
    const w = word.trim()
    if (w.length === 0) return false
    // Filter out isolated single noise characters like "स", "ड", "गगे" at the start
    if (w.length <= 2 && !/[अ-हA-Za-z0-9]/.test(w)) return false
    return true
  })

  let cleaned = cleanWords.join(' ').replace(/\s+/g, ' ').trim()

  // 4. Ensure Devanagari text is clean without leading/trailing symbols
  cleaned = cleaned.replace(/^[^अ-हA-Za-z]+/, '').trim()

  return cleaned
}

/**
 * Extract Official Police Subject Sentence
 * Finds actual Hindi subject phrase ending with 'के संबंध में' or 'समीक्षा के संबंध'
 */
export function extractSmartHindiSubjectSentence(ocrText: string): string {
  if (!ocrText) return ''

  // Look for 'के संबंध में' or 'समीक्षा के संबंध' or 'हेतु' phrase
  const matchSubj = ocrText.match(/([अ-ह\s\d\-,\(\)]+(?:के संबंध में|समीक्षा के संबंध|के विषय में|कार्रवाही हेतु|हेतु प्रेषित))/i)

  if (matchSubj && matchSubj[1]) {
    let cleanSubj = matchSubj[1].replace(/^[^\u0900-\u097F]+/, '').trim()
    // Keep only last 15-20 meaningful Hindi words
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
