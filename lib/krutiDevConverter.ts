/**
 * KrutiDev 010 to Unicode Devanagari Converter Engine
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

  // Replace common Krutidev words first
  Object.entries(wordMap).forEach(([kWord, uWord]) => {
    const reg = new RegExp(kWord, 'g')
    text = text.replace(reg, uWord)
  })

  // Reposition 'f' (Chhoti I Matra) for Devanagari Range \u0900-\u097F
  text = text.replace(/f([\u0900-\u097F])/g, '$1ि')
  text = text.replace(/f([a-zA-Z])/g, '$1ि')

  // Character by character mapping fallback
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

  return modifiedText
}
