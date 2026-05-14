import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'
import ReviewForm from '@/components/admin/ReviewForm'

export default async function ReviewPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()
  if (!isAdmin(user)) redirect('/dashboard')

  const supabase = createAdminClient()

  const { data: submission, error } = await supabase
    .from('submissions')
    .select('*, task:tasks(*), review:reviews(*)')
    .eq('id', params.id)
    .single()

  if (error) console.error('[ReviewPage] fetch submission error:', error)
  if (!submission) notFound()

  const TYPE_ICONS: Record<string, string> = { file: '📎', link: '🔗', text: '✍️' }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Back */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-600 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Submissions
        </Link>
      </div>

      {/* Task + Submission Header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4 shadow-card">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-lg font-extrabold text-gray-900 leading-snug">
              {submission.task?.title ?? 'Task'}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {[submission.task?.field, submission.task?.major].filter(Boolean).join(' · ') || '—'}
            </p>
          </div>
          <span className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_COLORS[submission.status]}`}>
            {STATUS_LABELS[submission.status]}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-gray-50 pt-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Submission type</p>
            <p className="text-sm font-semibold text-gray-700 capitalize flex items-center gap-1.5">
              <span>{TYPE_ICONS[submission.task?.submission_type] ?? '📝'}</span>
              {submission.task?.submission_type}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Submitted on</p>
            <p className="text-sm font-semibold text-gray-700">
              {new Date(submission.created_at).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">User ID</p>
            <p className="text-xs font-mono text-gray-400 truncate">
              {submission.user_id.slice(0, 12)}…
            </p>
          </div>
        </div>
      </div>

      {/* Task Description */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4 shadow-card">
        <h2 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Task Description</h2>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
          {submission.task?.description}
        </p>
        {submission.task?.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider w-full mb-1">Skills</p>
            {submission.task.skills.map((skill: string) => (
              <span key={skill} className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full border border-brand-100 font-medium">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* User Submission */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4 shadow-card">
        <h2 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">User Submission</h2>
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4">
          {submission.task?.submission_type === 'file' ? (
            <a
              href={submission.content}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-semibold hover:underline"
            >
              📎 View uploaded file →
            </a>
          ) : submission.task?.submission_type === 'link' ? (
            <a
              href={submission.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-600 hover:text-brand-700 font-medium hover:underline break-all"
            >
              {submission.content}
            </a>
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {submission.content}
            </p>
          )}
        </div>
      </div>

      {/* Review Form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            {submission.review ? 'Edit Review' : 'Write Review'}
          </h2>
          {submission.review && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5">
              <span className="text-xs text-emerald-600 font-medium">Current score:</span>
              <span className="text-sm font-extrabold text-emerald-700">{submission.review.score}/100</span>
            </div>
          )}
        </div>
        <ReviewForm
          submissionId={submission.id}
          reviewerId={user!.id}
          existingReview={submission.review ?? null}
        />
      </div>

    </div>
  )
}
