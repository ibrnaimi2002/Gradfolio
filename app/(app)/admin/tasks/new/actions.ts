'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser, isAdmin } from '@/lib/auth'

export async function createTask(formData: FormData): Promise<{ error?: string }> {
  const user = await getCurrentUser()
  if (!isAdmin(user)) return { error: 'Unauthorized' }

  const title = (formData.get('title') as string ?? '').trim()
  const description = (formData.get('description') as string ?? '').trim()
  const field = (formData.get('field') as string ?? '').trim()
  const major = (formData.get('major') as string ?? '').trim()
  const skillsRaw = (formData.get('skills') as string ?? '').trim()
  const submission_type = (formData.get('submission_type') as string ?? '').trim()
  const deadline = (formData.get('deadline') as string ?? '').trim() || null

  const skills = skillsRaw
    ? skillsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const supabase = createAdminClient()

  const { error } = await supabase.from('tasks').insert({
    title,
    description,
    field,
    major,
    skills,
    submission_type,
    deadline,
  })

  if (error) return { error: error.message }
  return {}
}
