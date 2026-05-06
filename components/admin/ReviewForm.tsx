'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Toast from '@/components/Toast'
import { Review } from '@/types'

interface ReviewFormProps {
  submissionId: string
  reviewerId: string
  existingReview: Review | null
}

export default function ReviewForm({
  submissionId,
  reviewerId,
  existingReview,
}: ReviewFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [score, setScore] = useState<number>(existingReview?.score ?? 0)
  const [feedback, setFeedback] = useState(existingReview?.feedback ?? '')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (existingReview) {
        const { error } = await supabase
          .from('reviews')
          .update({ score, feedback, reviewed_at: new Date().toISOString() })
          .eq('id', existingReview.id)

        if (error) {
          console.error('[ReviewForm] update error:', error)
          throw error
        }
      } else {
        const { error: reviewError } = await supabase.from('reviews').insert({
          submission_id: submissionId,
          score,
          feedback,
          reviewed_by: reviewerId,
        })

        if (reviewError) {
          console.error('[ReviewForm] insert review error:', reviewError)
          throw reviewError
        }

        const { error: statusError } = await supabase
          .from('submissions')
          .update({ status: 'reviewed' })
          .eq('id', submissionId)

        if (statusError) {
          console.error('[ReviewForm] update status error:', statusError)
          throw statusError
        }
      }

      setToast({ message: 'Review submitted successfully!', type: 'success' })
      setTimeout(() => {
        router.push('/admin')
        router.refresh()
      }, 1200)
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ?? 'Failed to submit review.'
      console.error('[ReviewForm] caught error:', err)
      setToast({ message: msg, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkUnderReview() {
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'under_review' })
      .eq('id', submissionId)

    if (error) {
      console.error('[ReviewForm] mark under_review error:', error)
      setToast({ message: error.message, type: 'error' })
    } else {
      setToast({ message: 'Marked as under review.', type: 'success' })
      router.refresh()
    }
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

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Score</label>
            <span className="text-2xl font-bold text-brand-600">
              {score}/100
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* Presets */}
        <div className="flex gap-2">
          {[25, 50, 75, 90, 100].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setScore(preset)}
              className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors
                ${
                  score === preset
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-gray-200 text-gray-500 hover:border-brand-300'
                }`}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Feedback */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Feedback
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            placeholder="Write constructive feedback for the student..."
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleMarkUnderReview}
            className="flex-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            Mark Under Review
          </button>
          <button
            type="submit"
            disabled={loading || !feedback.trim()}
            className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            {loading
              ? 'Submitting...'
              : existingReview
              ? 'Update Review'
              : 'Submit Review'}
          </button>
        </div>
      </form>
    </>
  )
}
