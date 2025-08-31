import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://bhagegnikobkzntjugwa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoYWdlZ25pa29ia3pudGp1Z3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzczMDgsImV4cCI6MjA3MjIxMzMwOH0.NxCA5Q_oiQqeaUlnsXrx7xznOHbGwpd9eJsyEse1rsQ'

// Platform-specific configuration for better Android compatibility
const supabaseOptions = {
  auth: {
    detectSessionInUrl: false,
    persistSession: true,
    autoRefreshToken: true,
    storage: Platform.OS !== 'web' ? AsyncStorage : undefined,
  },
  global: {
    headers: {
      'X-Client-Info': `expo-app/${Platform.OS}`,
    },
  },
  ...(Platform.OS === 'android' && {
    realtime: {
      params: {
        eventsPerSecond: 2,
      },
    },
  }),
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions)