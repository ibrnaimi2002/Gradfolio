'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ADMIN_EMAIL } from '@/lib/constants'

interface NavbarProps {
  userEmail: string | null
}

export default function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const isAdmin = userEmail === ADMIN_EMAIL

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href={isAdmin ? '/admin' : '/tasks'}
            className="text-xl font-bold text-brand-600"
          >
            GradFolio
          </Link>

          <div className="flex items-center gap-6">
            {!isAdmin && (
              <>
                <Link
                  href="/tasks"
                  className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors"
                >
                  Tasks
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors"
                >
                  Settings
                </Link>
</>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors"
              >
                Admin
              </Link>
            )}

            <span className="text-sm text-gray-400 hidden sm:block">
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
