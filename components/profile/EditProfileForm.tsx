'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/lib/actions/profile-actions'

interface Props {
  initialDisplayName: string
  initialBio: string
}

export default function EditProfileForm({ initialDisplayName, initialBio }: Props) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await updateProfile(new FormData(e.currentTarget))

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setIsEditing(false)
      setLoading(false)
      router.refresh()
    }
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 border border-brand-200 hover:border-brand-300 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition-all duration-150"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit Profile
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 pt-5 border-t border-gray-100 space-y-4">
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
          ⚠️ {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Display Name
        </label>
        <input
          name="display_name"
          type="text"
          defaultValue={initialDisplayName}
          placeholder="How you want to be known"
          maxLength={60}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Bio
          <span className="text-gray-400 font-normal ml-1">max 300 chars</span>
        </label>
        <textarea
          name="bio"
          defaultValue={initialBio}
          placeholder="A short intro about yourself and what you're working on…"
          rows={3}
          maxLength={300}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none bg-gray-50 focus:bg-white transition-all"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
        >
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
