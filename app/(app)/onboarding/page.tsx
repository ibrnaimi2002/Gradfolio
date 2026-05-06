'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import FieldSelector from '@/components/FieldSelector'
import MajorSelector from '@/components/MajorSelector'
import Toast from '@/components/Toast'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<1 | 2>(1)
  const [field, setField] = useState<string | null>(null)
  const [major, setMajor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  async function handleFinish() {
    if (!field || !major) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      field,
      major,
    })

    if (error) {
      setToast({ message: error.message, type: 'error' })
      setLoading(false)
      return
    }

    router.push('/tasks')
    router.refresh()
  }

  function handleFieldSelect(f: string) {
    setField(f)
    setMajor(null)
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
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-brand-500' : 'bg-gray-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-brand-500' : 'bg-gray-200'}`} />
        </div>

        <div className="mb-8">
          <p className="text-sm font-medium text-brand-600 mb-1">
            Step {step} of 2
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 1 ? 'What is your field?' : 'What is your major?'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1
              ? 'Choose the broad area that best describes your studies.'
              : `Select your specialization within ${field}.`}
          </p>
        </div>

        {step === 1 && (
          <>
            <FieldSelector selected={field} onSelect={handleFieldSelect} />
            <button
              onClick={() => setStep(2)}
              disabled={!field}
              className="mt-6 w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Continue →
            </button>
          </>
        )}

        {step === 2 && field && (
          <>
            <MajorSelector field={field} selected={major} onSelect={setMajor} />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                ← Back
              </button>
              <button
                onClick={handleFinish}
                disabled={!major || loading}
                className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {loading ? 'Saving...' : 'Start Browsing Tasks'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
