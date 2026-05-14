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
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('profiles').upsert({ id: user.id, field, major })

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

  const STEPS = [
    { label: 'Choose your field', description: 'The broad area of your studies' },
    { label: 'Choose your major', description: `Your specialization within ${field ?? '...'}` },
  ]

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-5 shadow-md">
              <span className="text-white text-xl font-bold">G</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome to GradFolio</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Let&apos;s set up your profile so we can show you the right tasks.
            </p>
          </div>

          {/* Step card */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-card p-8">

            {/* Progress */}
            <div className="flex items-center gap-3 mb-8">
              {STEPS.map((s, i) => {
                const stepNum = i + 1
                const isActive = step === stepNum
                const isDone = step > stepNum
                return (
                  <div key={stepNum} className="flex items-center gap-3 flex-1">
                    <div className={`flex items-center gap-2.5 flex-1 min-w-0`}>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 ${
                          isDone
                            ? 'bg-brand-600 text-white'
                            : isActive
                            ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-400'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isDone ? '✓' : stepNum}
                      </div>
                      <div className="min-w-0 hidden sm:block">
                        <p className={`text-xs font-bold truncate ${isActive ? 'text-brand-700' : isDone ? 'text-gray-700' : 'text-gray-400'}`}>
                          {s.label}
                        </p>
                      </div>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-0.5 w-8 sm:w-12 rounded-full transition-all duration-300 ${step > stepNum ? 'bg-brand-500' : 'bg-gray-100'}`} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Step header */}
            <div className="mb-7">
              <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1.5">
                Step {step} of 2
              </p>
              <h2 className="text-xl font-extrabold text-gray-900">
                {step === 1 ? 'What is your field?' : 'What is your major?'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {step === 1
                  ? 'Choose the broad area that best describes your studies.'
                  : `Select your specialization within ${field}.`}
              </p>
            </div>

            {/* Selector */}
            {step === 1 && (
              <>
                <FieldSelector selected={field} onSelect={handleFieldSelect} />
                <button
                  onClick={() => setStep(2)}
                  disabled={!field}
                  className="mt-6 w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-sm hover:shadow-md"
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
                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-3.5 rounded-xl transition-all text-sm border border-gray-100"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleFinish}
                    disabled={!major || loading}
                    className="flex-2 flex-grow bg-brand-600 hover:bg-brand-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Setting up…
                      </span>
                    ) : (
                      'Start Browsing Tasks'
                    )}
                  </button>
                </div>
              </>
            )}

          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            You can change your field and major anytime in Settings.
          </p>
        </div>
      </div>
    </>
  )
}
