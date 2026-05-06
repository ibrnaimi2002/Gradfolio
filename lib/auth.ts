import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('[auth] getUser error:', error.message)
    return null
  }

  return user
}

export function isAdmin(user: User | null): boolean {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gradfolio.com'
  const result = !!user && user.email === adminEmail

  console.log(
    '[auth] isAdmin — user.email:', user?.email ?? 'none',
    '| ADMIN_EMAIL:', adminEmail,
    '| granted:', result
  )

  return result
}
