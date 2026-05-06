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

  if (!isAdmin(user)) {
    redirect('/dashboard')
  }

  const supabase = createAdminClient()

  const { data: submission, error } = await supabase
    .from('submissions')
    .select('*, task:tasks(*), review:reviews(*)')
    .eq('id', params.id)
    .single()

  if (error) {
    console.error('[ReviewPage] fetch submission error:', error)
  }

  if (!submission) notFound()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-brand-600 transition-colors"
        >
          ← Back to Admin
        </Link>
      </div>

      {/* User + Task header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {submission.task?.title ?? 'Task'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {[submission.task?.field, submission.task?.major].filter(Boolean).join(' · ') || '—'}
            </p>
          </div>
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${
              STATUS_COLORS[submission.status]
            }`}
          >
            {STATUS_LABELS[submission.status]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Submission type</p>
            <p className="font-medium capitalize">
              {submission.task?.submission_type}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Submitted on</p>
            <p className="font-medium">
              {new Date(submission.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Task description */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          Task Description
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {submission.task?.description}
        </p>
        {submission.task?.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {submission.task.skills.map((skill: string) => (
              <span
                key={skill}
                className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submission content */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          User Submission
        </h2>
        <div className="bg-gray-50 rounded-xl px-4 py-3">
          {submission.task?.submission_type === 'file' ? (
            <a
              href={submission.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-600 hover:underline break-all"
            >
              View uploaded file →
            </a>
          ) : submission.task?.submission_type === 'link' ? (
            <a
              href={submission.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-600 hover:underline break-all"
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

      {/* Review form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          {submission.review ? 'Edit Review' : 'Write Review'}
        </h2>
        <ReviewForm
          submissionId={submission.id}
          reviewerId={user!.id}
          existingReview={submission.review ?? null}
        />
      </div>
    </div>
  )
}
