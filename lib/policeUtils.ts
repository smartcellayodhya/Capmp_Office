import * as XLSX from 'xlsx'
import { OfficerRow, OfficerWithCalculated } from '@/types/police'

export interface ParsedRank {
  coreRank: 'Inspector' | 'Sub-Inspector' | 'Head Constable' | 'Constable' | 'Computer Operator'
  gender: 'Male' | 'Female'
  specialDuty: string
  isSuspendedByRank: boolean
}

/**
 * 1. getSmartDutyDisplay
 * Determines exact field display role based on coreRank and specialDuty.
 */
export function getSmartDutyDisplay(coreRank: string = '', specialDuty: string = ''): string {
  const c = coreRank.toLowerCase()
  const d = specialDuty.toLowerCase()

  if (d.includes('thana prabhari') || d.includes('थाना प्रभारी') || d.includes('sho') || d.includes('so')) {
    if (c.includes('inspector') && !c.includes('sub')) {
      return 'SHO (प्रभारी निरीक्षक)'
    }
    return 'SO (थानाध्यक्ष)'
  }

  if (d.includes('chowki incharge') || d.includes('चौकी प्रभारी')) {
    return 'Chowki Incharge (चौकी प्रभारी)'
  }

  return specialDuty || 'General Duty'
}

/**
 * 2. parsePoliceRank
 */
export function parsePoliceRank(rawRank: string = '', roleType: string = ''): ParsedRank {
  const r = (rawRank || '').trim()
  const role = (roleType || '').trim()
  const combined = `${r} ${role}`.toLowerCase()

  // 1. Suspension Check ('नि0 ', 'निलंबित', 'suspended')
  const isSuspendedByRank = r.startsWith('नि0 ') || r.includes('निलंबित') || r.toLowerCase().includes('suspended')

  // Clean rank string
  const cleanRankStr = r.replace(/^नि0\s+/, '').trim()

  // 2. Gender Extraction ('महिला', 'म0')
  let gender: 'Male' | 'Female' = 'Male'
  if (r.includes('महिला') || r.includes('म0') || r.toLowerCase().includes('female') || r.toLowerCase().includes('w/')) {
    gender = 'Female'
  }

  // 3. Special Duty & Field Leadership Extraction
  let specialDuty = 'General Duty'

  if (combined.includes('थाना प्रभारी') || combined.includes('प्रभारी निरीक्षक') || combined.includes('थानाध्यक्ष') || combined.includes('thana prabhari') || combined.includes('sho') || combined.includes('so')) {
    specialDuty = 'Thana Prabhari'
  } else if (combined.includes('चौकी प्रभारी') || combined.includes('chowki incharge')) {
    specialDuty = 'Chowki Incharge'
  } else if (combined.includes('सीसीटीएनएस') || combined.includes('cctns')) {
    specialDuty = 'CCTNS'
  } else if (combined.includes('मालखाना') || combined.includes('malkhana')) {
    specialDuty = 'Maalkhana Incharge'
  } else if (combined.includes('का0मु0') || combined.includes('मुन्शी') || combined.includes('मुंशी')) {
    specialDuty = 'Munshi'
  } else if (combined.includes('हे0मो0') || combined.includes('मोहर्रिर')) {
    specialDuty = 'Head Moharir'
  } else if (combined.includes('चालक') || combined.includes('चाल0') || combined.includes('driver')) {
    specialDuty = 'Driver'
  } else if (combined.includes('एलआईयू') || combined.includes('liu')) {
    specialDuty = 'LIU'
  } else if (combined.includes('यातायात') || combined.includes('ट्रैफिक') || combined.includes('traffic') || combined.includes('ti')) {
    specialDuty = 'Traffic'
  }

  // 4. Core Rank Normalization (Exactly 5 Clean Columns)
  let coreRank: ParsedRank['coreRank'] = 'Constable'

  if (cleanRankStr.includes('ऑपरेटर') || cleanRankStr.includes('कंप्यूटर') || cleanRankStr.toUpperCase().includes('OPERATOR')) {
    coreRank = 'Computer Operator'
  } else if (cleanRankStr.includes('उ0नि0') || cleanRankStr.includes('उप निरीक्षक') || cleanRankStr.toUpperCase().includes('SUB-INSPECTOR') || cleanRankStr.toUpperCase().includes('SI')) {
    coreRank = 'Sub-Inspector'
  } else if (cleanRankStr.includes('निरीक्षक') || cleanRankStr.includes('नि0') || cleanRankStr.toUpperCase().includes('INSPECTOR') || cleanRankStr.toUpperCase().includes('SHO')) {
    coreRank = 'Inspector'
  } else if (cleanRankStr.includes('हे0 का0') || cleanRankStr.includes('हे0का0') || cleanRankStr.includes('मुख्य आरक्षी') || cleanRankStr.toUpperCase().includes('HEAD CONSTABLE') || cleanRankStr.toUpperCase().includes('HC')) {
    coreRank = 'Head Constable'
  } else if (cleanRankStr.includes('का0') || cleanRankStr.includes('आरक्षी') || cleanRankStr.toUpperCase().includes('CONSTABLE')) {
    coreRank = 'Constable'
  }

  return {
    coreRank,
    gender,
    specialDuty,
    isSuspendedByRank
  }
}

export function getBatchYear(pno: string): string {
  if (!pno || typeof pno !== 'string' || pno.length < 2) return 'N/A'
  const digits = pno.substring(0, 2)
  const num = parseInt(digits, 10)
  if (isNaN(num)) return 'N/A'
  
  const fullYear = num >= 80 ? `19${digits}` : `20${digits}`
  return `${fullYear} Batch`
}

export function calculateTenureMonths(joiningPostingDate?: string | null): number {
  if (!joiningPostingDate) return 0
  const postingDate = new Date(joiningPostingDate)
  if (isNaN(postingDate.getTime())) return 0
  
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - postingDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 30.4375)
}

export function checkOverstay(tenureMonths: number): boolean {
  return tenureMonths >= 36
}

export function getRetirementInfo(dob?: string | null) {
  if (!dob) {
    return { retirementYearsRemaining: 0, retirementMonthsRemaining: 0, isRetiringSoon: false, isRetiringUrgent: false }
  }
  const birthDate = new Date(dob)
  if (isNaN(birthDate.getTime())) {
    return { retirementYearsRemaining: 0, retirementMonthsRemaining: 0, isRetiringSoon: false, isRetiringUrgent: false }
  }

  const retirementDate = new Date(birthDate.getFullYear() + 60, birthDate.getMonth(), birthDate.getDate())
  const now = new Date()
  
  const diffTime = retirementDate.getTime() - now.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const monthsRemaining = Math.floor(diffDays / 30.4375)
  const yearsRemaining = parseFloat((monthsRemaining / 12).toFixed(1))
  
  return {
    retirementYearsRemaining: yearsRemaining,
    retirementMonthsRemaining: monthsRemaining,
    isRetiringSoon: monthsRemaining >= 0 && monthsRemaining <= 12,
    isRetiringUrgent: monthsRemaining >= 0 && monthsRemaining <= 6
  }
}

export function enrichOfficerData(officer: Partial<OfficerRow>, postingDate?: string): OfficerWithCalculated {
  const parsed = parsePoliceRank(officer.rank || '', officer.role_type || '')

  const effectiveStatus = (officer.status === 'Suspended' || parsed.isSuspendedByRank) 
    ? 'Suspended' 
    : (officer.status || 'Active')

  const smartDutyDisplay = getSmartDutyDisplay(parsed.coreRank, parsed.specialDuty)

  const safeOfficer: OfficerRow = {
    id: officer.id || 'N/A',
    pno: officer.pno || 'N/A',
    name: officer.name || 'Unknown Officer',
    rank: officer.rank || 'N/A',
    officer_tier: officer.officer_tier || 'Non-Gazetted',
    current_posting: officer.current_posting || 'N/A',
    role_type: officer.role_type || 'Staff',
    caste_category: officer.caste_category || 'General',
    dob: officer.dob || '',
    joining_date: officer.joining_date || '',
    status: effectiveStatus as any,
    mobile_number: officer.mobile_number || 'N/A',
    seat_assigned: officer.seat_assigned || 'Unassigned Desk',
    created_at: officer.created_at,
    updated_at: officer.updated_at
  }

  const tenureMonths = calculateTenureMonths(postingDate || safeOfficer.joining_date)
  const overstay = checkOverstay(tenureMonths)
  const retInfo = getRetirementInfo(safeOfficer.dob)
  const batchYear = getBatchYear(safeOfficer.pno)

  return {
    ...safeOfficer,
    batchYear,
    tenureMonths,
    isOverstay: overstay,
    coreRank: parsed.coreRank,
    gender: parsed.gender,
    specialDuty: parsed.specialDuty,
    smartDutyDisplay,
    ...retInfo
  }
}

export function exportOfficersToExcel(officers: OfficerWithCalculated[], filename = 'Ayodhya_Police_Personnel_Report.xlsx') {
  const exportData = officers.map((o) => ({
    'PNO Number': o.pno || 'N/A',
    'Batch Year': o.batchYear || 'N/A',
    'Officer Name': o.name || 'Unknown',
    'Core Rank': o.coreRank || 'N/A',
    'Raw Rank': o.rank || 'N/A',
    'Field Leadership Duty': o.smartDutyDisplay || 'General Duty',
    'Gender': o.gender || 'Male',
    'Tier': o.officer_tier || 'N/A',
    'Role Type': o.role_type || 'N/A',
    'Caste Category': o.caste_category || 'N/A',
    'Current Posting': o.current_posting || 'N/A',
    'Seat Assigned': o.seat_assigned || 'Unassigned',
    'Mobile Number': o.mobile_number || 'N/A',
    'Tenure (Months)': o.tenureMonths ?? 0,
    'Overstay Status': o.isOverstay ? 'OVERSTAY (>36 Mos)' : 'Normal',
    'Status': o.status || 'Active',
    'Joining Date': o.joining_date || 'N/A'
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)

  const colWidths = [
    { wch: 14 },
    { wch: 12 },
    { wch: 24 },
    { wch: 18 },
    { wch: 20 },
    { wch: 26 },
    { wch: 10 },
    { wch: 15 },
    { wch: 18 },
    { wch: 14 },
    { wch: 25 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 12 },
    { wch: 14 }
  ]
  worksheet['!cols'] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Personnel Report')
  
  XLSX.writeFile(workbook, filename)
}
