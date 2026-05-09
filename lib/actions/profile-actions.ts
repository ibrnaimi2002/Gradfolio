'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'

export async function updateProfile(
  formData: FormData
): Promise<{ error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }

  const display_name =
    ((formData.get('display_name') as string) ?? '').trim() || null
  const bio = ((formData.get('bio') as string) ?? '').trim() || null

  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ display_name, bio })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return {}
}
