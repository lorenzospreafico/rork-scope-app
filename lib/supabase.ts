import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bhagegnikobkzntjugwa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoYWdlZ25pa29ia3pudGp1Z3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzczMDgsImV4cCI6MjA3MjIxMzMwOH0.NxCA5Q_oiQqeaUlnsXrx7xznOHbGwpd9eJsyEse1rsQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)