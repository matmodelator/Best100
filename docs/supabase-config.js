import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://fnodbpiwkkrdgqvmyanq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZub2RicGl3a2tyZGdxdm15YW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDk5MDAsImV4cCI6MjA4OTAyNTkwMH0.Gi4l3LAU3S4T77_2xgVWKmkeW34xblrJf04IlE4zu9I'

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)
