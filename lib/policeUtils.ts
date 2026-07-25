import * as XLSX from 'xlsx'
import { OfficerRow, OfficerWithCalculated } from '@/types/police'

/**
 * Requirement 2.1: Batch Year Calculation
 * Extracts the first 2 digits of the `pno` string to dynamically display "Batch Year".
 * E.g., '182050012' -> '2018 Batch', '041029834' -> '2004 Batch', '981290342' -> '1998 Batch'
 */
export function getBatchYear(pno: string): string {
  if (!pno || pno.length < 2) return 'N/A'
  const digits = pno.substring(0, 2)
  const num = parseInt(digits, 10)
  if (isNaN(num)) return 'N/A'
  
  // If digits are >= 80, it refers to 1980s/1990s batch (e.g. 94 -> 1994)
  // Otherwise 2000s batch (e.g. 18 -> 2018, 04 -> 2004)
  const fullYear = num >= 80 ? `19${digits}` : `20${digits}`
  return `${fullYear} Batch`
}

/**
 * Requirement 2.2: Tenure & Overstay Alert
 * Compares current posting joining date / posting date.
 * If spent in current_posting exceeds 3 years (36 months), flag with high-priority "Overstay / Transfer Due".
 */
export function calculateTenureMonths(joiningPostingDate: string): number {
  if (!joiningPostingDate) return 0
  const postingDate = new Date(joiningPostingDate)
  const now = new Date()
  
  const diffTime = Math.abs(now.getTime() - postingDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 30.4375)
}

export function checkOverstay(tenureMonths: number): boolean {
  return tenureMonths >= 36
}

/**
 * Requirement 2.3: Retirement Tracker
 * Uses `dob` to calculate upcoming retirements within the next 6 to 12 months.
 * UP Police superannuation age is 60 years.
 */
export function getRetirementInfo(dob: string) {
  if (!dob) {
    return { retirementYearsRemaining: 0, retirementMonthsRemaining: 0, isRetiringSoon: false, isRetiringUrgent: false }
  }
  const birthDate = new Date(dob)
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

/**
 * Enriches raw officer record with calculated logic fields
 */
export function enrichOfficerData(officer: OfficerRow, postingDate?: string): OfficerWithCalculated {
  // We use joining_date or simulated posting date to calculate current posting tenure
  const tenureMonths = calculateTenureMonths(postingDate || officer.joining_date)
  const overstay = checkOverstay(tenureMonths)
  const retInfo = getRetirementInfo(officer.dob)
  const batchYear = getBatchYear(officer.pno)

  return {
    ...officer,
    batchYear,
    tenureMonths,
    isOverstay: overstay,
    ...retInfo
  }
}

/**
 * Requirement 4: One-Click Excel Export
 * Exports currently filtered table data to an Excel (.xlsx) file using the `xlsx` library.
 */
export function exportOfficersToExcel(officers: OfficerWithCalculated[], filename = 'UP_Police_Officers_Report.xlsx') {
  const exportData = officers.map((o) => ({
    'PNO Number': o.pno,
    'Batch Year': o.batchYear,
    'Officer Name': o.name,
    'Rank': o.rank,
    'Tier': o.officer_tier,
    'Role Type': o.role_type,
    'Caste Category': o.caste_category,
    'Current Posting': o.current_posting,
    'Tenure (Months)': o.tenureMonths,
    'Overstay Status': o.isOverstay ? 'OVERSTAY (>36 Mos)' : 'Normal',
    'Retirement Status': o.isRetiringUrgent ? 'Urgent (<6 Mos)' : o.isRetiringSoon ? 'Retiring Soon (<12 Mos)' : 'Regular',
    'Status': o.status,
    'Date of Birth': o.dob,
    'Joining Date': o.joining_date
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)

  // Auto-fit column width
  const colWidths = [
    { wch: 14 }, // PNO
    { wch: 12 }, // Batch
    { wch: 24 }, // Name
    { wch: 18 }, // Rank
    { wch: 15 }, // Tier
    { wch: 18 }, // Role
    { wch: 14 }, // Caste
    { wch: 25 }, // Posting
    { wch: 15 }, // Tenure
    { wch: 20 }, // Overstay
    { wch: 22 }, // Retirement
    { wch: 12 }, // Status
    { wch: 14 }, // DOB
    { wch: 14 }  // Joining Date
  ]
  worksheet['!cols'] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Personnel Report')
  
  XLSX.writeFile(workbook, filename)
}
