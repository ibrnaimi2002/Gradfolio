'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ADMIN_EMAIL } from '@/lib/constants'

interface NavbarProps {
  userEmail: string | null
}

interface NavLink {
  label: string
  href: string
  highlight?: boolean
}

const USER_LINKS: NavLink[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Tasks', href: '/tasks' },
  { label: 'Profile', href: '/profile' },
  { label: 'Settings', href: '/settings' },
]

const ADMIN_LINKS: NavLink[] = [
  { label: 'Submissions', href: '/admin' },
  { label: 'Tasks', href: '/admin/tasks' },
  { label: '+ Create Task', href: '/admin/tasks/new', highlight: true },
]

export default function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const isAdmin = userEmail === ADMIN_EMAIL

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  function isActive(href: string) {
    if (href === '/admin') {
      return pathname === '/admin' || pathname.startsWith('/admin/submissions')
    }
    if (href === '/admin/tasks') {
      return (
        pathname === '/admin/tasks' ||
        (pathname.startsWith('/admin/tasks/') &&
          !pathname.startsWith('/admin/tasks/new'))
      )
    }
    if (href === '/tasks') {
      return pathname === '/tasks' || pathname.startsWith('/tasks/')
    }
    return pathname === href
  }

  const links = isAdmin ? ADMIN_LINKS : USER_LINKS

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={isAdmin ? '/admin' : '/dashboard'}
            className="text-xl font-bold text-brand-600 shrink-0"
          >
            GradFolio
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const active = isActive(link.href)

              if (link.highlight) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="ml-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold hidden sm:inline">
                Admin
              </span>
            )}
            <span className="text-sm text-gray-400 hidden md:block truncate max-w-[160px]">
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
