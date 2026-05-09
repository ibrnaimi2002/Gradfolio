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
        className="text-xs font-medium text-brand-600 hover:text-brand-700 border border-brand-200 hover:border-brand-300 px-3 py-1.5 rounded-lg transition-colors"
      >
        Edit Profile
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 pt-5 border-t border-gray-100 space-y-4">
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Display Name
        </label>
        <input
          name="display_name"
          type="text"
          defaultValue={initialDisplayName}
          placeholder="How you want to be known"
          maxLength={60}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Bio{' '}
          <span className="text-gray-400 font-normal">max 300 characters</span>
        </label>
        <textarea
          name="bio"
          defaultValue={initialBio}
          placeholder="A short intro about yourself and what you're working on..."
          rows={3}
          maxLength={300}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
