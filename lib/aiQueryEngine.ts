import { OfficerWithCalculated } from '@/types/police'

export interface AIQueryResult {
  query: string
  title: string
  summary: string
  count: number
  officers: OfficerWithCalculated[]
  recommendation?: string
  confidenceScore: number
  chartType?: 'bar' | 'pie' | 'line'
  suggestedFollowups: string[]
}

/**
 * Executes Natural Language Search in English or Hindi
 */
export function executeAIQuery(query: string, officers: OfficerWithCalculated[]): AIQueryResult {
  const q = (query || '').toLowerCase().trim()

  // 1. Suspended Officers ("suspended", "निलंबित", "निलंबन")
  if (q.includes('suspend') || q.includes('निलंब') || q.includes('निलंबित')) {
    const matched = officers.filter((o) => o.status === 'Suspended')
    return {
      query,
      title: 'Disciplinary Action - Suspended Personnel',
      summary: `Found ${matched.length} officer(s) currently under departmental suspension.`,
      count: matched.length,
      officers: matched,
      confidenceScore: 98,
      recommendation: 'Review pending departmental inquiry files and initiate reinstatement or charge-sheet proceedings.',
      chartType: 'bar',
      suggestedFollowups: [
        'Show inspectors suspended',
        'List pending transfer applications',
        'Export suspended personnel report'
      ]
    }
  }

  // 2. Retiring Soon / Retiring this year ("retire", "रिटायर", "सेवानिवृत्त", "6 months")
  if (q.includes('retire') || q.includes('रिटायर') || q.includes('सेवानिवृत्त')) {
    const matched = officers.filter((o) => o.isRetiringSoon || o.retirementMonthsRemaining <= 12)
    return {
      query,
      title: 'Retirement Roster - Retiring Within 12 Months',
      summary: `Found ${matched.length} officer(s) due for pension & retirement within the next 12 months.`,
      count: matched.length,
      officers: matched,
      confidenceScore: 96,
      recommendation: 'Prepare pension papers, GPF final settlement files, and schedule succession postings.',
      chartType: 'line',
      suggestedFollowups: [
        'Who retires in 6 months?',
        'Show inspectors retiring soon',
        'Export retirement timeline'
      ]
    }
  }

  // 3. Inspectors ("inspector", "निरीक्षक", "sho")
  if (q.includes('inspector') || q.includes('निरीक्षक') || q.includes('sho')) {
    const matched = officers.filter((o) => o.coreRank === 'Inspector' || o.rank.includes('निरीक्षक'))
    return {
      query,
      title: 'Inspectors Cadre Roster',
      summary: `Found ${matched.length} Inspector(s) active across district police stations and units.`,
      count: matched.length,
      officers: matched,
      confidenceScore: 99,
      recommendation: 'Ensure all key A-Category police stations have gazetted/senior Inspectors as SHO.',
      chartType: 'bar',
      suggestedFollowups: [
        'Show Inspectors above 55 years',
        'List Inspectors on Thana Prabhari duty',
        'Export Inspector list'
      ]
    }
  }

  // 4. Female Officers ("female", "महिला", "women")
  if (q.includes('female') || q.includes('महिला') || q.includes('women')) {
    const matched = officers.filter((o) => o.gender === 'Female')
    return {
      query,
      title: 'Female Police Personnel Strength',
      summary: `Found ${matched.length} female police officer(s) deployed across district units.`,
      count: matched.length,
      officers: matched,
      confidenceScore: 97,
      recommendation: 'Deploy female personnel in Mahila Thana, Anti-Romeo Squads, and CCTNS Desks.',
      chartType: 'pie',
      suggestedFollowups: [
        'Show female constables',
        'Show female Sub-Inspectors',
        'Export female personnel list'
      ]
    }
  }

  // 5. Incomplete Profiles / Missing Mobiles ("incomplete", "mobile", "फोन", "अधूरा")
  if (q.includes('incomplete') || q.includes('mobile') || q.includes('phone') || q.includes('अधूरा')) {
    const matched = officers.filter((o) => !o.mobile_number || o.mobile_number === 'N/A' || o.seat_assigned === 'Unassigned Desk')
    return {
      query,
      title: 'Incomplete Personnel Profiles & Missing Contact Records',
      summary: `Found ${matched.length} officer(s) with incomplete contact numbers or unassigned desk records.`,
      count: matched.length,
      officers: matched,
      confidenceScore: 94,
      recommendation: 'Notify Camp Office clerks to update mobile numbers and desk allocations.',
      chartType: 'bar',
      suggestedFollowups: [
        'Show officers with missing mobile numbers',
        'List unassigned desk staff',
        'Export incomplete profiles'
      ]
    }
  }

  // 6. Overstay (>36 months) ("overstay", "36 months", "3 साल")
  if (q.includes('overstay') || q.includes('36') || q.includes('3 साल')) {
    const matched = officers.filter((o) => o.isOverstay)
    return {
      query,
      title: 'Tenure Overstay Flagged Personnel (>36 Months)',
      summary: `Found ${matched.length} officer(s) exceeding 36 months in current posting.`,
      count: matched.length,
      officers: matched,
      confidenceScore: 95,
      recommendation: 'Initiate routine district transfer board recommendations for tenure rotation.',
      chartType: 'bar',
      suggestedFollowups: [
        'Show Sub-Inspectors overstaying',
        'List pending transfer applications',
        'Export overstay report'
      ]
    }
  }

  // Default General Keyword Search Across Name, PNO, Rank, Posting
  const matched = officers.filter((o) => {
    const combinedStr = `${o.name} ${o.pno} ${o.rank} ${o.coreRank} ${o.current_posting} ${o.specialDuty} ${o.smartDutyDisplay}`.toLowerCase()
    return combinedStr.includes(q)
  })

  return {
    query,
    title: `AI Search Results for "${query}"`,
    summary: `Found ${matched.length} personnel matching query parameters across district command database.`,
    count: matched.length,
    officers: matched,
    confidenceScore: 90,
    recommendation: 'Filter or export personnel records for district administration.',
    chartType: 'bar',
    suggestedFollowups: [
      'Show suspended officers',
      'Who retires this year?',
      'List all Inspectors',
      'Export NGO list'
    ]
  }
}
