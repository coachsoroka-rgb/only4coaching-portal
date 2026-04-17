import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const supabase = createClient(
  'https://lnmnjuirqrncizkharsx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxubW5qdWlycXJuY2l6a2hhcnN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MDM0MDcsImV4cCI6MjA5MTk3OTQwN30.UgvS-kpoQdvlsErWr5Vs3VXTnGrcREzRec64VqSyuto'
)
