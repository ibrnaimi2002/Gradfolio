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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: task } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!task) notFound()

  // Check for existing submission
  const { data: submission } = await supabase
    .from('submissions')
    .select('*, review:reviews(*)')
    .eq('user_id', user.id)
    .eq('task_id', task.id)
    .maybeSingle()

  const deadline = new Date(task.deadline)
  const isPast = deadline < new Date()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/tasks"
          className="text-sm text-gray-500 hover:text-brand-600 transition-colors"
        >
          ← Back to Tasks
        </Link>
      </div>

      {/* Task info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-snug">
              {task.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {task.major} · {task.field}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400 mb-0.5">Deadline</p>
            <p className={`text-sm font-semibold ${isPast ? 'text-red-500' : 'text-gray-700'}`}>
              {deadline.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-5">
          {task.description}
        </p>

        {task.skills.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Skills tested
            </p>
            <div className="flex flex-wrap gap-2">
              {task.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="text-xs bg-brand-50 text-brand-700 px-3 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submission section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        {submission ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Your Submission</h2>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[submission.status]}`}
              >
                {STATUS_LABELS[submission.status]}
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
              {task.submission_type === 'file' ? (
                <a
                  href={submission.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-600 hover:underline break-all"
                >
                  View uploaded file →
                </a>
              ) : task.submission_type === 'link' ? (
                <a
                  href={submission.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-600 hover:underline break-all"
                >
                  {submission.content}
                </a>
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {submission.content}
                </p>
              )}
            </div>

            {submission.review && (
              <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">Review</p>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-brand-600">
                      {submission.review.score}
                    </span>
                    <span className="text-sm text-gray-500">/100</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{submission.review.feedback}</p>
              </div>
            )}
          </div>
        ) : isPast ? (
          <div className="text-center py-6">
            <p className="text-3xl mb-3">⏰</p>
            <p className="text-sm font-medium text-gray-700">
              This task has expired
            </p>
            <p className="text-xs text-gray-500 mt-1">
              The deadline has passed. You can no longer submit.
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-semibold text-gray-900 mb-1">
              Submit your work
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {task.submission_type === 'text' &&
                'Write your response in the box below.'}
              {task.submission_type === 'link' &&
                'Paste a link to your work (GitHub, Figma, Google Docs…).'}
              {task.submission_type === 'file' &&
                'Upload a file with your completed work.'}
            </p>
            <SubmissionForm task={task} userId={user.id} />
          </>
        )}
      </div>
    </div>
  )
}
