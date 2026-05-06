'use client'

import { FIELDS } from '@/lib/constants'

const FIELD_ICONS: Record<string, string> = {
  IT: '💻',
  Business: '📊',
  Design: '🎨',
}

const FIELD_DESCRIPTIONS: Record<string, string> = {
  IT: 'Software, Data, Cybersecurity',
  Business: 'Marketing, Finance, Strategy',
  Design: 'Graphic Design, UI/UX',
}

interface FieldSelectorProps {
  selected: string | null
  onSelect: (field: string) => void
}

export default function FieldSelector({ selected, onSelect }: FieldSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {FIELDS.map((field) => (
        <button
          key={field}
          onClick={() => onSelect(field)}
          className={`flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all cursor-pointer
            ${
              selected === field
                ? 'border-brand-500 bg-brand-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-brand-300 hover:bg-gray-50'
            }`}
        >
          <span className="text-4xl mb-3">{FIELD_ICONS[field]}</span>
          <span className="font-semibold text-gray-900 mb-1">{field}</span>
          <span className="text-xs text-gray-500">{FIELD_DESCRIPTIONS[field]}</span>
        </button>
      ))}
    </div>
  )
}
