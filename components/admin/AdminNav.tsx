'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Submissions', href: '/admin' },
  { label: 'Tasks', href: '/admin/tasks' },
]

export default function AdminNav() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin') {
      return pathname === '/admin' || pathname.startsWith('/admin/submissions')
    }
    return pathname.startsWith('/admin/tasks')
  }

  return (
    <div className="flex gap-1 mb-8 border-b border-gray-200">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            isActive(tab.href)
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
