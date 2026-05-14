import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SubmissionForm from '@/components/SubmissionForm'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'

export default async function TaskDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: task } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!task) notFound()

  const { data: submission } = await supabase
    .from('submissions')
    .select('*, review:reviews(*)')
    .eq('user_id', user.id)
    .eq('task_id', task.id)
    .maybeSingle()

  const deadline = new Date(task.deadline)
  const isPast = deadline < new Date()
  const days = Math.ceil((deadline.getTime() - Date.now()) / 86400000)
  const deadlineColor = isPast
    ? 'text-red-600 bg-red-50 border-red-100'
    : days <= 1
    ? 'text-orange-600 bg-orange-50 border-orange-100'
    : days <= 7
    ? 'text-yellow-700 bg-yellow-50 border-yellow-100'
    : 'text-gray-600 bg-gray-50 border-gray-100'

  const TYPE_ICONS: Record<string, string> = { file: '📎', link: '🔗', text: '✍️' }
  const typeIcon = TYPE_ICONS[task.submission_type] ?? '📝'

  return (
    <div className="max-w-3xl mx-auto">

      {/* Back + breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-600 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tasks
        </Link>
      </div>

      {/* Task card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-7 mb-5 shadow-card">

        {/* Tags row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs bg-brand-50 text-brand-700 px-3 py-1 rounded-full font-semibold border border-brand-100">
            {task.field}
          </span>
          <span className="text-xs bg-gray-50 text-gray-600 px-3 py-1 rounded-full font-semibold border border-gray-100">
            {task.major}
          </span>
          <span className="text-xs bg-gray-50 text-gray-500 px-3 py-1 rounded-full font-medium border border-gray-100 flex items-center gap-1">
            {typeIcon} {task.submission_type}
          </span>
          <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full border ${deadlineColor}`}>
            {isPast ? 'Expired' : days === 0 ? 'Due today' : days === 1 ? '1 day left' : `${days} days left`}
          </span>
        </div>

        <h1 className="text-xl font-extrabold text-gray-900 leading-snug mb-3">
          {task.title}
        </h1>

        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-6">
          {task.description}
        </p>

        {task.skills.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 mb-2.5 uppercase tracking-wider">
              Skills you&apos;ll demonstrate
            </p>
            <div className="flex flex-wrap gap-2">
              {task.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="text-xs bg-brand-50 text-brand-700 px-3 py-1.5 rounded-full font-medium border border-brand-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submission section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-card">

        {submission ? (
          <div>
            {/* Submission header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900">Your Submission</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Submitted on{' '}
                  {new Date(submission.created_at).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${STATUS_COLORS[submission.status]}`}>
                {STATUS_LABELS[submission.status]}
              </span>
            </div>

            {/* Submission content */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 mb-5">
              {task.submission_type === 'file' ? (
                <a
                  href={submission.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-semibold hover:underline"
                >
                  📎 View uploaded file →
                </a>
              ) : task.submission_type === 'link' ? (
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

            {/* Review */}
            {submission.review ? (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Expert Review</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(submission.review.reviewed_at).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-center bg-white rounded-xl px-4 py-2 border border-emerald-200 shadow-sm">
                    <span className="text-2xl font-extrabold text-emerald-700">
                      {submission.review.score}
                    </span>
                    <span className="text-sm text-emerald-500">/100</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;{submission.review.feedback}&rdquo;
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 flex items-center gap-3">
                <span className="text-xl">⏳</span>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Awaiting review</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Your submission is being reviewed. Check back soon.
                  </p>
                </div>
              </div>
            )}
          </div>

        ) : isPast ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">⏰</p>
            <p className="text-base font-bold text-gray-700">This task has expired</p>
            <p className="text-sm text-gray-400 mt-1">
              The deadline has passed. You can no longer submit.
            </p>
            <Link
              href="/tasks"
              className="inline-block mt-5 text-sm text-brand-600 hover:text-brand-700 font-semibold"
            >
              Browse other tasks →
            </Link>
          </div>

        ) : (
          <div>
            <div className="mb-6">
              <h2 className="font-bold text-gray-900 mb-1">Submit your work</h2>
              <p className="text-sm text-gray-500">
                {task.submission_type === 'text' && 'Write your response in the box below.'}
                {task.submission_type === 'link' && 'Paste a link to your work (GitHub, Figma, Google Docs…).'}
                {task.submission_type === 'file' && 'Upload a file with your completed work.'}
              </p>
            </div>
            <SubmissionForm task={task} userId={user.id} />
          </div>
        )}

      </div>
    </div>
  )
}
