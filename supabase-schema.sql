-- =============================================
-- ONLY4COACHING PORTAL — DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- CLIENTS TABLE
create table clients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  email text unique not null,
  first_name text,
  last_name text,
  age integer,
  weight_kg numeric,
  height_cm numeric,
  occupation text,
  status text default 'new', -- new | active | inactive
  portal_access boolean default false,
  coach_notes text
);

-- ONBOARDING TABLE
create table onboarding (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  client_id uuid references clients(id) on delete cascade,
  injuries text,
  medical_conditions text,
  medication boolean default false,
  primary_goals text,
  training_experience text,
  goal_description text,
  target_weight_kg numeric,
  sleep_hours text,
  stress_level integer,
  nutrition_habits text,
  alcohol text,
  training_frequency text,
  lifestyle_notes text,
  consent boolean default false
);

-- INBODY SCANS TABLE
create table inbody_scans (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  client_id uuid references clients(id) on delete cascade,
  scan_date date not null,
  body_weight_kg numeric,
  body_fat_percent numeric,
  skeletal_muscle_kg numeric,
  body_fat_mass_kg numeric,
  visceral_fat integer,
  bmr_kcal integer,
  body_water_l numeric,
  debrief_notes text
);

-- DOCUMENTS TABLE
create table documents (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  client_id uuid references clients(id) on delete cascade,
  doc_type text, -- nutrition | training | goal_agreement | inbody | other
  label text,
  file_path text,
  file_url text,
  uploaded_by text default 'coach'
);

-- GOAL AGREEMENTS TABLE
create table goal_agreements (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  client_id uuid references clients(id) on delete cascade,
  quarter text,
  status text default 'draft', -- draft | pending | signed
  primary_goal text,
  strength_targets text,
  nutrition_commitment text,
  sessions_per_week text,
  coach_commitment text,
  next_review date,
  private_notes text
);

-- MESSAGES TABLE
create table messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  client_id uuid references clients(id) on delete cascade,
  sender text not null, -- 'coach' | 'client'
  content text not null,
  read boolean default false
);

-- STORAGE BUCKET for PDFs
insert into storage.buckets (id, name, public) values ('documents', 'documents', false);

-- ROW LEVEL SECURITY
alter table clients enable row level security;
alter table onboarding enable row level security;
alter table inbody_scans enable row level security;
alter table documents enable row level security;
alter table goal_agreements enable row level security;
alter table messages enable row level security;

-- POLICIES: Allow all for now (tighten after testing)
create policy "Allow all" on clients for all using (true) with check (true);
create policy "Allow all" on onboarding for all using (true) with check (true);
create policy "Allow all" on inbody_scans for all using (true) with check (true);
create policy "Allow all" on documents for all using (true) with check (true);
create policy "Allow all" on goal_agreements for all using (true) with check (true);
create policy "Allow all" on messages for all using (true) with check (true);

-- Storage policy
create policy "Allow all storage" on storage.objects for all using (true) with check (true);
