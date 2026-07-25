import * as XLSX from 'xlsx'
import { OfficerRow, OfficerWithCalculated } from '@/types/police'

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
    status: officer.status || 'Active',
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
    ...retInfo
  }
}

export function exportOfficersToExcel(officers: OfficerWithCalculated[], filename = 'Ayodhya_Police_Personnel_Report.xlsx') {
  const exportData = officers.map((o) => ({
    'PNO Number': o.pno || 'N/A',
    'Batch Year': o.batchYear || 'N/A',
    'Officer Name': o.name || 'Unknown',
    'Rank': o.rank || 'N/A',
    'Tier': o.officer_tier || 'N/A',
    'Role Type': o.role_type || 'N/A',
    'Caste Category': o.caste_category || 'N/A',
    'Current Posting': o.current_posting || 'N/A',
    'Seat Assigned': o.seat_assigned || 'Unassigned',
    'Mobile Number': o.mobile_number || 'N/A',
    'Tenure (Months)': o.tenureMonths ?? 0,
    'Overstay Status': o.isOverstay ? 'OVERSTAY (>36 Mos)' : 'Normal',
    'Retirement Status': o.isRetiringUrgent ? 'Urgent (<6 Mos)' : o.isRetiringSoon ? 'Retiring Soon (<12 Mos)' : 'Regular',
    'Status': o.status || 'Active',
    'Date of Birth': o.dob || 'N/A',
    'Joining Date': o.joining_date || 'N/A'
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)

  const colWidths = [
    { wch: 14 },
    { wch: 12 },
    { wch: 24 },
    { wch: 18 },
    { wch: 15 },
    { wch: 18 },
    { wch: 14 },
    { wch: 25 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 22 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 }
  ]
  worksheet['!cols'] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Personnel Report')
  
  XLSX.writeFile(workbook, filename)
}
