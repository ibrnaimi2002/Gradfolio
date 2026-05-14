'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import FieldSelector from '@/components/FieldSelector'
import MajorSelector from '@/components/MajorSelector'
import Toast from '@/components/Toast'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [field, setField] = useState<string | null>(null)
  const [major, setMajor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setField(profile.field)
        setMajor(profile.major)
      }
      setInitialLoading(false)
    }
    loadProfile()
  }, [supabase, router])

  function handleFieldSelect(f: string) {
    setField(f)
    setMajor(null)
    setSaved(false)
  }

  async function handleSave() {
    if (!field || !major) return
    setLoading(true)
    setSaved(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase
      .from('profiles')
      .update({ field, major })
      .eq('id', user.id)

    if (error) {
      setToast({ message: error.message, type: 'error' })
    } else {
      setToast({ message: 'Profile updated! Tasks have been refreshed.', type: 'success' })
      setSaved(true)
    }
    setLoading(false)
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading settings…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            Update your field and major. This changes which tasks appear in your task list.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-card p-6 space-y-8">

          {/* Field */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Field</h2>
              {field && (
                <span className="text-xs bg-brand-50 text-brand-700 border border-brand-100 px-2.5 py-0.5 rounded-full font-semibold">
                  {field}
                </span>
              )}
            </div>
            <FieldSelector selected={field} onSelect={handleFieldSelect} />
          </div>

          {/* Major */}
          {field && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Major</h2>
                {major && (
                  <span className="text-xs bg-brand-50 text-brand-700 border border-brand-100 px-2.5 py-0.5 rounded-full font-semibold">
                    {major}
                  </span>
                )}
              </div>
              <MajorSelector field={field} selected={major} onSelect={(m) => { setMajor(m); setSaved(false) }} />
            </div>
          )}

          {/* Save button */}
          <div className="pt-2 border-t border-gray-50">
            <button
              onClick={handleSave}
              disabled={!field || !major || loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-sm hover:shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </span>
              ) : saved ? (
                '✓ Changes saved'
              ) : (
                'Save Changes'
              )}
            </button>
          </div>

        </div>

        {/* Danger info */}
        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <span className="text-base mt-0.5">⚠️</span>
          <p className="text-xs text-amber-700 leading-relaxed">
            Changing your field or major will update your task list. Previously submitted tasks
            are not affected.
          </p>
        </div>

      </div>
    </>
  )
}
