'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Submissions', href: '/admin', icon: '📥' },
  { label: 'Tasks', href: '/admin/tasks', icon: '📋' },
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
    <div className="flex gap-1 mb-7 bg-gray-50 border border-gray-100 rounded-xl p-1 w-fit">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
            isActive(tab.href)
              ? 'bg-white text-gray-900 shadow-sm border border-gray-100'
              : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
          }`}
        >
          <span>{tab.icon}</span>
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
