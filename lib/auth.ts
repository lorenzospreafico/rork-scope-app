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

export async function generatePlan(plan_id: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')
  const resp = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate_plan`, {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      // IMPORTANT: Relay the auth token so the function can validate (optional for v1)
      Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
    },
    body: JSON.stringify({ user_id: user.id, plan_id })
  })
  const json = await resp.json()
  if (!resp.ok) throw new Error(json.error || 'Plan generation failed')
  return json
}

export async function getWorkoutsRange(fromISO: string, toISO: string) {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .gte('scheduled_date', fromISO)
    .lte('scheduled_date', toISO)
    .order('scheduled_date', { ascending: true })
  if (error) throw error
  return data
}

export async function createWorkout({
  scheduled_date,
  title,
  duration_min,
  details
}: {
  scheduled_date: string
  title: string
  duration_min: number
  details?: { notes?: string }
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { data, error } = await supabase.from('workouts').insert({
    user_id: user.id,
    scheduled_date,
    source: 'manual',
    title,
    duration_min,
    details
  }).select().single()
  
  if (error) throw error
  return data
}

export async function createRecurringActivity({
  title,
  pillar,
  day_of_week,
  duration_min,
  details
}: {
  title: string
  pillar: Pillar
  day_of_week: number // 0-6
  duration_min: number
  details?: { location?: string }
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { data, error } = await supabase.from('recurring_activities').insert({
    user_id: user.id,
    title,
    pillar,
    day_of_week,
    duration_min,
    details
  }).select().single()
  
  if (error) throw error
  return data
}

export async function completeWorkout(workoutId: string) {
  const { data, error } = await supabase
    .from('workouts')
    .update({ status: 'completed' })
    .eq('id', workoutId)
    .select().single()
  
  if (error) throw error
  return data
}