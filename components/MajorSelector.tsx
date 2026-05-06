'use client'

import { MAJORS } from '@/lib/constants'

interface MajorSelectorProps {
  field: string
  selected: string | null
  onSelect: (major: string) => void
}

export default function MajorSelector({ field, selected, onSelect }: MajorSelectorProps) {
  const majors = MAJORS[field] || []

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {majors.map((major) => (
        <button
          key={major}
          onClick={() => onSelect(major)}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer
            ${
              selected === major
                ? 'border-brand-500 bg-brand-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-brand-300 hover:bg-gray-50'
            }`}
        >
          <div
            className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center
            ${selected === major ? 'border-brand-500' : 'border-gray-300'}`}
          >
            {selected === major && (
              <div className="w-2 h-2 rounded-full bg-brand-500" />
            )}
          </div>
          <span className="font-medium text-gray-900">{major}</span>
        </button>
      ))}
    </div>
  )
}
