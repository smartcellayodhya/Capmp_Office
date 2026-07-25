import { OfficerRow, PostingHistoryRow, PostingApplicationRow, NodalOfficerRow } from '@/types/police'

export const mockOfficers: OfficerRow[] = [
  // --- GAZETTED OFFICERS (GOs) ---
  {
    id: 'off-1',
    pno: '142050012',
    name: 'Vikramaditya Singh, IPS',
    rank: 'Senior Superintendent of Police (SSP)',
    officer_tier: 'Gazetted',
    current_posting: 'District Headquarters, Lucknow',
    role_type: 'District Head',
    caste_category: 'General',
    dob: '1978-04-12',
    joining_date: '2014-09-01',
    status: 'Active'
  },
  {
    id: 'off-2',
    pno: '161049281',
    name: 'Rajesh Kumar Verma, PPS',
    rank: 'Additional Superintendent of Police (Addl SP)',
    officer_tier: 'Gazetted',
    current_posting: 'Crime Branch, Kanpur Nagar',
    role_type: 'Addl SP Crime',
    caste_category: 'OBC',
    dob: '1974-11-23',
    joining_date: '2016-01-15',
    status: 'Active'
  },
  {
    id: 'off-3',
    pno: '182039481',
    name: 'Ananya Sharma, PPS',
    rank: 'Deputy SP / Circle Officer (CO)',
    officer_tier: 'Gazetted',
    current_posting: 'Circle Sadar, Varanasi',
    role_type: 'Circle Officer',
    caste_category: 'General',
    dob: '1985-08-19',
    joining_date: '2018-07-10',
    status: 'Active'
  },
  {
    id: 'off-4',
    pno: '982049182',
    name: 'Harish Chandra Gautam, PPS',
    rank: 'Deputy SP / Circle Officer (CO)',
    officer_tier: 'Gazetted',
    current_posting: 'Circle Civil Lines, Prayagraj',
    role_type: 'Circle Officer',
    caste_category: 'SC',
    dob: '1966-10-05', // Retiring in ~3 months
    joining_date: '1998-03-22',
    status: 'Active'
  },
  {
    id: 'off-5',
    pno: '193049102',
    name: 'Devendra Nath Yadav, PPS',
    rank: 'Deputy SP / Circle Officer (CO)',
    officer_tier: 'Gazetted',
    current_posting: 'Circle Gomti Nagar, Lucknow',
    role_type: 'Circle Officer',
    caste_category: 'OBC',
    dob: '1982-01-14',
    joining_date: '2019-11-01',
    status: 'Anumodit'
  },
  {
    id: 'off-6',
    pno: '201930492',
    name: 'Shalini Tripathi, IPS',
    rank: 'Superintendent of Police (SP)',
    officer_tier: 'Gazetted',
    current_posting: 'Cyber Crime Cell, HQ Lucknow',
    role_type: 'Nodal Officer',
    caste_category: 'General',
    dob: '1988-06-30',
    joining_date: '2020-08-15',
    status: 'Active'
  },

  // --- NON-GAZETTED OFFICERS (NGOs) ---
  {
    id: 'off-7',
    pno: '152930491',
    name: 'Raghvendra Singh',
    rank: 'Inspector (SHO)',
    officer_tier: 'Non-Gazetted',
    current_posting: 'Police Station Hazratganj, Lucknow',
    role_type: 'Thana Prabhari',
    caste_category: 'General',
    dob: '1976-02-18',
    joining_date: '2015-04-10', // Overstay (>36 months in same station)
    status: 'Active'
  },
  {
    id: 'off-8',
    pno: '172049182',
    name: 'Manoj Kumar Maurya',
    rank: 'Inspector (SHO)',
    officer_tier: 'Non-Gazetted',
    current_posting: 'Police Station Kotwali, Kanpur',
    role_type: 'Thana Prabhari',
    caste_category: 'OBC',
    dob: '1979-09-12',
    joining_date: '2017-06-01', // Overstay
    status: 'Active'
  },
  {
    id: 'off-9',
    pno: '192039182',
    name: 'Suresh Chandra Paswan',
    rank: 'Sub-Inspector (SI)',
    officer_tier: 'Non-Gazetted',
    current_posting: 'Chowki Janpath, Hazratganj',
    role_type: 'Chowki Incharge',
    caste_category: 'SC',
    dob: '1984-12-01',
    joining_date: '2019-02-14',
    status: 'Active'
  },
  {
    id: 'off-10',
    pno: '661029384',
    name: 'Ramakant Shukla',
    rank: 'Sub-Inspector (SI)',
    officer_tier: 'Non-Gazetted',
    current_posting: 'Police Station Cantonment, Gorakhpur',
    role_type: 'Staff',
    caste_category: 'General',
    dob: '1966-11-20', // Retiring in ~4 months!
    joining_date: '1992-05-18',
    status: 'Transfer Pending'
  },
  {
    id: 'off-11',
    pno: '210920491',
    name: 'Priyanka Rawat',
    rank: 'Sub-Inspector (SI)',
    officer_tier: 'Non-Gazetted',
    current_posting: 'Chowki University, Varanasi',
    role_type: 'Chowki Incharge',
    caste_category: 'SC',
    dob: '1992-03-25',
    joining_date: '2021-01-20',
    status: 'Active'
  },
  {
    id: 'off-12',
    pno: '132049182',
    name: 'Brijesh Singh Yadav',
    rank: 'Inspector (SHO)',
    officer_tier: 'Non-Gazetted',
    current_posting: 'Police Station Tajganj, Agra',
    role_type: 'Thana Prabhari',
    caste_category: 'OBC',
    dob: '1975-07-04',
    joining_date: '2013-08-11',
    status: 'Anumodit'
  },
  {
    id: 'off-13',
    pno: '221029384',
    name: 'Amit Kumar Gond',
    rank: 'Head Constable',
    officer_tier: 'Non-Gazetted',
    current_posting: 'Police Station Sadar, Meerut',
    role_type: 'Staff',
    caste_category: 'ST',
    dob: '1989-10-14',
    joining_date: '2022-04-05',
    status: 'Active'
  },
  {
    id: 'off-14',
    pno: '112039482',
    name: 'Dharmendra Kumar Saini',
    rank: 'Sub-Inspector (SI)',
    officer_tier: 'Non-Gazetted',
    current_posting: 'Chowki Industrial Area, Ghaziabad',
    role_type: 'Chowki Incharge',
    caste_category: 'OBC',
    dob: '1981-05-30',
    joining_date: '2011-10-10',
    status: 'Active'
  },
  {
    id: 'off-15',
    pno: '660829102',
    name: 'Santosh Kumar Kori',
    rank: 'Head Constable',
    officer_tier: 'Non-Gazetted',
    current_posting: 'Police Lines, Bareilly',
    role_type: 'Staff',
    caste_category: 'SC',
    dob: '1966-12-15', // Retiring in ~5 months
    joining_date: '1990-09-01',
    status: 'On Leave'
  }
]

export const mockPostingHistory: Record<string, PostingHistoryRow[]> = {
  '142050012': [
    { id: 'ph-1', officer_pno: '142050012', station_name: 'SSP Office Lucknow', posting_date: '2022-05-10', duration_months: 26 },
    { id: 'ph-2', officer_pno: '142050012', station_name: 'SP City Kanpur Nagar', posting_date: '2019-01-15', duration_months: 40 },
    { id: 'ph-3', officer_pno: '142050012', station_name: 'CO Circle Sadar Gorakhpur', posting_date: '2016-06-01', duration_months: 31 },
    { id: 'ph-4', officer_pno: '142050012', station_name: 'Under Training, NPA Hyderabad', posting_date: '2014-09-01', duration_months: 21 }
  ],
  '152930491': [
    { id: 'ph-5', officer_pno: '152930491', station_name: 'Police Station Hazratganj, Lucknow', posting_date: '2020-03-01', duration_months: 52 }, // > 36 mos overstay
    { id: 'ph-6', officer_pno: '152930491', station_name: 'PS Gautampalli, Lucknow', posting_date: '2017-08-15', duration_months: 30 },
    { id: 'ph-7', officer_pno: '152930491', station_name: 'PS Chowk, Varanasi', posting_date: '2015-04-10', duration_months: 28 }
  ],
  '182039481': [
    { id: 'ph-8', officer_pno: '182039481', station_name: 'Circle Sadar, Varanasi', posting_date: '2021-11-01', duration_months: 32 },
    { id: 'ph-9', officer_pno: '182039481', station_name: 'Circle Bhelupur, Varanasi', posting_date: '2018-07-10', duration_months: 40 }
  ],
  '982049182': [
    { id: 'ph-10', officer_pno: '982049182', station_name: 'Circle Civil Lines, Prayagraj', posting_date: '2022-01-10', duration_months: 30 },
    { id: 'ph-11', officer_pno: '982049182', station_name: 'PS Colonelganj, Prayagraj', posting_date: '2018-04-01', duration_months: 45 }
  ]
}

export const mockApplications: PostingApplicationRow[] = [
  {
    id: 'app-1',
    officer_pno: '152930491',
    current_station: 'PS Hazratganj, Lucknow',
    requested_station: 'PS Gomti Nagar, Lucknow',
    reason: 'Tenure completed over 3 years; administrative request.',
    status: 'Pending',
    created_at: '2024-06-10'
  },
  {
    id: 'app-2',
    officer_pno: '172049182',
    current_station: 'PS Kotwali, Kanpur',
    requested_station: 'Crime Branch, Kanpur',
    reason: 'Health grounds & medical condition of spouse.',
    status: 'Pending',
    created_at: '2024-07-01'
  },
  {
    id: 'app-3',
    officer_pno: '661029384',
    current_station: 'PS Cantonment, Gorakhpur',
    requested_station: 'Police Lines, Gorakhpur',
    reason: 'Superannuation due within 6 months.',
    status: 'Approved',
    created_at: '2024-05-15'
  }
]

export const mockNodalOfficers: NodalOfficerRow[] = [
  {
    id: 'nodal-1',
    officer_pno: '201930492',
    subject_duty: 'Cyber Crime & Special Task Force Cell',
    assigned_date: '2023-01-15',
    status: 'Active'
  },
  {
    id: 'nodal-2',
    officer_pno: '161049281',
    subject_duty: 'VIP Security & VVIP Escort Protocol',
    assigned_date: '2022-09-01',
    status: 'Active'
  },
  {
    id: 'nodal-3',
    officer_pno: '182039481',
    subject_duty: 'Elections & Law and Order Cell',
    assigned_date: '2024-02-10',
    status: 'Active'
  }
]
