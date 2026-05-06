import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, task:tasks(*), review:reviews(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const stats = {
    total: submissions?.length ?? 0,
    reviewed: submissions?.filter((s) => s.status === 'reviewed').length ?? 0,
    pending: submissions?.filter((s) => s.status !== 'reviewed').length ?? 0,
    avgScore:
      submissions && submissions.filter((s) => s.review).length > 0
        ? Math.round(
            submissions
              .filter((s) => s.review)
              .reduce((acc, s) => acc + (s.review?.score ?? 0), 0) /
              submissions.filter((s) => s.review).length
          )
        : null,
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {profile.major} · {profile.field}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Submissions', value: stats.total },
          { label: 'Reviewed', value: stats.reviewed },
          { label: 'Pending', value: stats.pending },
          {
            label: 'Avg. Score',
            value: stats.avgScore !== null ? `${stats.avgScore}/100` : '—',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-xl p-4"
          >
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Submissions list */}
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        Submissions
      </h2>

      {!submissions || submissions.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
          <p className="text-4xl mb-4">📋</p>
          <h3 className="text-base font-semibold text-gray-700 mb-2">
            No submissions yet
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            Complete a task to see it here.
          </p>
          <Link
            href="/tasks"
            className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            Browse Tasks
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 truncate text-sm">
                    {sub.task?.title ?? 'Task'}
                  </h3>
                  <span
                    className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[sub.status]}`}
                  >
                    {STATUS_LABELS[sub.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Submitted{' '}
                  {new Date(sub.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                {sub.review && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700">
                        Review
                      </p>
                      <span className="text-sm font-bold text-brand-600">
                        {sub.review.score}/100
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{sub.review.feedback}</p>
                  </div>
                )}
              </div>
              <Link
                href={`/tasks/${sub.task_id}`}
                className="shrink-0 text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                View →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
