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
  }

  async function handleSave() {
    if (!field || !major) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase
      .from('profiles')
      .update({ field, major })
      .eq('id', user.id)

    if (error) {
      setToast({ message: error.message, type: 'error' })
    } else {
      setToast({ message: 'Profile updated!', type: 'success' })
    }
    setLoading(false)
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-sm text-gray-500 mb-8">
          Update your field and major. This affects which tasks you see.
        </p>

        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Field
            </h2>
            <FieldSelector selected={field} onSelect={handleFieldSelect} />
          </div>

          {field && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                Major
              </h2>
              <MajorSelector field={field} selected={major} onSelect={setMajor} />
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!field || !major || loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  )
}
