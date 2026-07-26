/**
 * Hindi Police Document OCR Engine
 * - Auto-detects Mangal Unicode vs KrutiDev 010
 * - Aggressively strips OCR noise (dots, symbols, mixed chars)
 * - Repairs common Hindi OCR mangling with police vocabulary dictionary
 */

// ─── KrutiDev 010 Lookup Tables ────────────────────────────────────────────

const krutiDevWordMap: Record<string, string> = {
  'vkj{kh': 'आरक्षी', 'fujh{kd': 'निरीक्षक', 'Fkkuk': 'थाना',
  'vijk/k': 'अपराध', 'lsok': 'सेवा', 'dk;kZy;': 'कार्यालय',
  'iqfyl': 'पुलिस', 'v/kh{kd': 'अधीक्षक', 'eqdnek': 'मुकदमा',
  'fobspuk': 'विवेचना', 'ljq{kk': 'सुरक्षा', 'M~;wVh': 'ड्यूटी',
  'NqV~Vh': 'छुट्टी', 'vodk': 'अवकाश', 'osru': 'वेतन',
  'izHkkjh': 'प्रभारी', 'izkFkZuk': 'प्रार्थना', 'fo"k;': 'विषय',
  'v;ks/;k': 'अयोध्या', 'tuji': 'जनपद', 'gsrq': 'हेतु', 'ee': 'में',
}

const kArr = [
  "ñ","Q+","q+","yk+","y+","j+","r+","s+","t+","k+","n+","o+","b+","m+","i+","A+","µ",
  "à","á","â","ä","å","æ","ç","è","é","ê","ë","ì","í","î","ï","ð","ñ","ò","ó","ô","õ","ö","÷",
  "ø","ù","ú","û","ü","ý","þ","ÿ","ñ","Q","w","e","r","t","y","u","i","o","p","[","]",
  "a","s","d","f","g","h","j","k","l",";","'","z","x","c","v","b","n","m",",",".","/",
  "Q","W","E","R","T","Y","U","I","O","P","{","}","A","S","D","F","G","H","J","K","L",":","\"",
  "Z","X","C","V","B","N","M","<",">","?","0","1","2","3","4","5","6","7","8","9",
]
const uArr = [
  "ऽ","फ़","क़","ख़","ग़","ज़","ड़","ढ़","फ़","क","न","य","ब","म","इ","अ","मं",
  "्र","रू","रू","हृ","द्व","द्य","द्घ","द्ब","द्ध","द्द","ट्ट","ट्ठ","ड्डे","ड्ढ","ह्न","ह्य","हृ","ह्म","ह्ल","ह्व","्","्","्","्","्","्","्","्","्","्","्","्",
  "ऽ","ु","ू","ा","ी","ी","ब","ह","ग","द","ज","ड","़","ं","े","क्","ि","ह","ी","र","ा","स","य","श्",
  "्र","ग","ब","त","इ","द","म","्","्","्","फ","ू","ा","ी","ी","ब","ह","ग","द","ज","ड","़",
  "ं","े","क्","ि","ह","ी","र","ा","स","य","श्","्र","ग","ब","त","इ","द","म","्","्","्",
  "०","१","२","३","४","५","६","७","८","९",
]

// ─── OCR Word Repair Dictionary (common mangling in police docs) ────────────
// Format: [corrupted_pattern_regex, correct_replacement]
const OCR_REPAIRS: [RegExp, string][] = [
  // Font / recognition mangling
  [/\bविध\b/g, 'विधि'],
  [/\bप्रगत\b/g, 'प्रगति'],
  [/\bसमीक्ष\b/g, 'समीक्षा'],
  [/\bसबंध\b/g, 'संबंध'],
  [/\bसम्बन्ध\b/g, 'संबंध'],
  [/\bकार्यदाय\b/g, 'कार्यदायी'],
  [/\bसंस्थ\b/g, 'संस्था'],
  [/\bगुलाई\b/g, 'जुलाई'],
  [/\bजुलाई\b/g, 'जुलाई'],
  [/\bहेत\b/g, 'हेतु'],
  [/\bनिर्माणाधिन\b/g, 'निर्माणाधीन'],
  [/\bप्रयोगशाला(?:ओं)?\b/g, 'प्रयोगशालाओं'],
  [/\bअध्यक्ष\b/g, 'अध्यक्ष'],
  [/\bअधीक्षक\b/g, 'अधीक्षक'],
  [/\bभवन\b/g, 'भवन'],
  [/\bबैठक\b/g, 'बैठक'],
  [/\bउतर\b/g, 'उत्तर'],
  [/\bप्रदेश\b/g, 'प्रदेश'],
  [/\bलखनऊ\b/g, 'लखनऊ'],
  [/\bआयोजित\b/g, 'आयोजित'],
  [/\bदिनांक\b/g, 'दिनांक'],
  [/\bअवलोकन\b/g, 'अवलोकन'],
  [/\bशासन\b/g, 'शासन'],
  [/\bपुलिस\b/g, 'पुलिस'],
  [/\bसप्कनभ\b/g, ''],       // pure garbage — delete
  [/\bमरिग\b/g, ''],          // garbage
  [/\bहैक\b/g, ''],            // garbage
  [/\bविंद\b/g, ''],           // garbage  
  [/\bसंक\b/g, ''],            // garbage
]

// ─── Step 1: Strip raw OCR noise symbols ─────────────────────────────────────
function stripRawNoise(text: string): string {
  return text
    // Remove Unicode symbols, emoji, hearts, arrows etc (but keep Devanagari & basic punctuation)
    .replace(/[^\u0900-\u097F\u0020-\u007E\n।,]/g, ' ')
    // Remove English letters entirely (OCR noise in Hindi docs)
    .replace(/[A-Za-z]+/g, ' ')
    // Remove English digits
    .replace(/[0-9]+/g, ' ')
    // Remove dots, dashes, underscores, slashes used as noise
    .replace(/[.…\-_/\\|!@#$%^&*()+=\[\]{}'"<>?`~;:]+/g, ' ')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── Step 2: Filter only valid pure-Devanagari words ──────────────────────────
function keepOnlyValidHindiWords(text: string): string {
  const tokens = text.split(/\s+/)
  const valid = tokens.filter((token) => {
    const t = token.trim()
    if (!t || t.length < 2) return false
    const devChars = (t.match(/[\u0900-\u097F]/g) || []).length
    const totalChars = t.replace(/\s/g, '').length
    // Must have ≥ 3 Devanagari chars AND ≥ 70% ratio to be considered a valid Hindi word
    return devChars >= 3 && (devChars / totalChars) >= 0.7
  })
  return valid.join(' ')
}

// ─── Step 3: Apply OCR repair dictionary ─────────────────────────────────────
function applyOCRRepairs(text: string): string {
  let t = text
  for (const [pattern, replacement] of OCR_REPAIRS) {
    t = t.replace(pattern, replacement)
  }
  // Clean up extra spaces after deletions
  return t.replace(/\s{2,}/g, ' ').trim()
}

// ─── KrutiDev 010 → Unicode converter ────────────────────────────────────────
function convertKrutiDev(text: string): string {
  let t = text
  Object.entries(krutiDevWordMap).forEach(([k, v]) => {
    t = t.replace(new RegExp(k, 'g'), v)
  })
  t = t.replace(/f([\u0900-\u097F])/g, '$1ि')
  let result = ''
  for (let i = 0; i < t.length; i++) {
    const idx = kArr.indexOf(t[i])
    result += (idx !== -1 && uArr[idx]) ? uArr[idx] : t[i]
  }
  return result
}

// ─── Main exported function ───────────────────────────────────────────────────

export function processDualFontHindiText(rawText: string): {
  cleanText: string
  detectedFont: 'Mangal Unicode' | 'KrutiDev 010'
} {
  if (!rawText || !rawText.trim()) return { cleanText: '', detectedFont: 'Mangal Unicode' }

  const devCount = (rawText.match(/[\u0900-\u097F]/g) || []).length
  const asciiCount = (rawText.match(/[a-zA-Z]/g) || []).length

  let processed: string
  let font: 'Mangal Unicode' | 'KrutiDev 010'

  if (devCount >= asciiCount * 0.5 || devCount > 15) {
    // Mangal Unicode path — strip noise then filter then repair
    processed = stripRawNoise(rawText)
    processed = keepOnlyValidHindiWords(processed)
    processed = applyOCRRepairs(processed)
    font = 'Mangal Unicode'
  } else {
    // KrutiDev path — convert first, then clean
    processed = convertKrutiDev(rawText)
    processed = stripRawNoise(processed)
    processed = keepOnlyValidHindiWords(processed)
    processed = applyOCRRepairs(processed)
    font = 'KrutiDev 010'
  }

  return { cleanText: processed, detectedFont: font }
}

// ─── Official Subject Sentence Extractor ─────────────────────────────────────

export function extractSmartHindiSubjectSentence(cleanWords: string): string {
  if (!cleanWords || cleanWords.trim().length < 8) {
    return 'विषय: (कृपया मैन्युअल रूप से भरें)'
  }

  // Priority patterns: look for "के संबंध में", "सम्बन्ध में", "हेतु" near key police terms
  const subjectMarkers = [
    /([^\s]{2,}(?:\s+[^\s]{2,}){2,10}(?:के संबंध में|सम्बन्ध में|के विषय में))/,
    /([^\s]{2,}(?:\s+[^\s]{2,}){2,10}(?:हेतु|आयोजित|प्रेषित))/,
    /((?:विधि विज्ञान|प्रयोगशाला|निर्माणाधीन|समीक्षा|बैठक)(?:\s+[^\s]{2,}){0,10})/,
  ]

  for (const pattern of subjectMarkers) {
    const match = cleanWords.match(pattern)
    if (match && match[1] && match[1].length > 10) {
      const subj = match[1].trim()
      return `विषय: ${subj}`
    }
  }

  // Fallback: join first N words
  const words = cleanWords.split(/\s+/).filter(w => w.length >= 3)
  if (words.length > 0) {
    const phrase = words.slice(0, 12).join(' ')
    return `विषय: ${phrase}`
  }

  return 'विषय: उत्तर प्रदेश पुलिस डांक संदर्भ।'
}
