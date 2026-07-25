-- =========================================================
-- UP Police Force Management System - Supabase SQL Schema
-- =========================================================

-- 1. Create Enums
CREATE TYPE officer_tier_enum AS ENUM ('Gazetted', 'Non-Gazetted');
CREATE TYPE caste_category_enum AS ENUM ('General', 'OBC', 'SC', 'ST');
CREATE TYPE application_status_enum AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE officer_status_enum AS ENUM ('Active', 'On Leave', 'Suspended', 'Anumodit', 'Transfer Pending');

-- 2. Table: officers
CREATE TABLE IF NOT EXISTS public.officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pno VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    rank VARCHAR(100) NOT NULL,
    officer_tier officer_tier_enum NOT NULL DEFAULT 'Non-Gazetted',
    current_posting VARCHAR(200) NOT NULL,
    role_type VARCHAR(100) NOT NULL, -- e.g. 'Circle Officer', 'Thana Prabhari', 'Chowki Incharge', 'Staff'
    caste_category caste_category_enum NOT NULL DEFAULT 'General',
    dob DATE NOT NULL,
    joining_date DATE NOT NULL,
    status officer_status_enum NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for high speed queries
CREATE INDEX IF NOT EXISTS idx_officers_pno ON public.officers(pno);
CREATE INDEX IF NOT EXISTS idx_officers_tier ON public.officers(officer_tier);
CREATE INDEX IF NOT EXISTS idx_officers_rank ON public.officers(rank);
CREATE INDEX IF NOT EXISTS idx_officers_caste ON public.officers(caste_category);
CREATE INDEX IF NOT EXISTS idx_officers_posting ON public.officers(current_posting);

-- 3. Table: posting_history
CREATE TABLE IF NOT EXISTS public.posting_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_pno VARCHAR(20) NOT NULL REFERENCES public.officers(pno) ON DELETE CASCADE ON UPDATE CASCADE,
    station_name VARCHAR(200) NOT NULL,
    posting_date DATE NOT NULL,
    duration_months INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posting_history_pno ON public.posting_history(officer_pno);

-- 4. Table: posting_applications
CREATE TABLE IF NOT EXISTS public.posting_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_pno VARCHAR(20) NOT NULL REFERENCES public.officers(pno) ON DELETE CASCADE ON UPDATE CASCADE,
    current_station VARCHAR(200) NOT NULL,
    requested_station VARCHAR(200) NOT NULL,
    reason TEXT NOT NULL,
    status application_status_enum NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posting_applications_pno ON public.posting_applications(officer_pno);
CREATE INDEX IF NOT EXISTS idx_posting_applications_status ON public.posting_applications(status);

-- 5. Table: nodal_officers
CREATE TABLE IF NOT EXISTS public.nodal_officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_pno VARCHAR(20) NOT NULL REFERENCES public.officers(pno) ON DELETE CASCADE ON UPDATE CASCADE,
    subject_duty VARCHAR(200) NOT NULL, -- e.g. 'VIP Security', 'Cyber Crime', 'Elections', 'Law & Order'
    assigned_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_nodal_officers_pno ON public.nodal_officers(officer_pno);

-- Row Level Security (RLS) Enablement
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posting_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posting_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodal_officers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon read access for dashboard view
CREATE POLICY "Allow public read officers" ON public.officers FOR SELECT USING (true);
CREATE POLICY "Allow public read posting_history" ON public.posting_history FOR SELECT USING (true);
CREATE POLICY "Allow public read posting_applications" ON public.posting_applications FOR SELECT USING (true);
CREATE POLICY "Allow public read nodal_officers" ON public.nodal_officers FOR SELECT USING (true);
