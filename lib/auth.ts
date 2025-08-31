import { supabase } from '@/lib/supabase'

type Pillar = 'cardio'|'strength'|'mobility'|'muscular_endurance'|'balance_stability'|'speed'

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

export async function saveOnboarding(
  priorities: Record<Pillar, number>, // 1..5
  length_weeks: 4|8|12|16|24,
  freq_per_week: 2|3|4|5|6|7,
  preferredDays?: number[] // 0..6
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  // Upsert priorities
  const rows = Object.entries(priorities).map(([pillar, priority]) => ({
    user_id: user.id, pillar, priority
  }))
  const { error: prErr } = await supabase.from('pillar_priorities').upsert(rows)
  if (prErr) throw prErr

  // Create (or update) active plan
  const { data: existing } = await supabase.from('plans').select('*').eq('user_id', user.id).eq('active', true).maybeSingle()
  if (existing) {
    await supabase.from('plans').update({ length_weeks, freq_per_week }).eq('id', existing.id)
    return existing.id
  } else {
    const { data: plan, error: plErr } = await supabase.from('plans')
      .insert({ user_id: user.id, length_weeks, freq_per_week })
      .select().single()
    if (plErr) throw plErr
    // preferred days (optional)
    if (preferredDays?.length) {
      const rows = preferredDays.map(dow => ({ user_id: user.id, dow }))
      await supabase.from('preferred_days').upsert(rows)
    }
    return plan.id
  }
}