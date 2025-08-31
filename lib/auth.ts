import { supabase } from '@/lib/supabase'

export async function signUp(fullName: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  const user = data.user
  if (!user) throw new Error('No user returned')

  // Create profile
  const { error: pErr } = await supabase.from('profiles').insert({
    user_id: user.id,
    full_name: fullName
  })
  if (pErr) throw pErr
  return user
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}