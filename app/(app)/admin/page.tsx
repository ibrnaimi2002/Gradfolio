import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const user = await getCurrentUser()

  if (!isAdmin(user)) redirect('/dashboard')

  const supabase = createAdminClient()
  const statusFilter = searchParams.status

  let query = supabase
    .from('submissions')
    .select('*, task:tasks(id, title, field, major)')
    .order('created_at', { ascending: false })

  if (statusFilter && ['submitted', 'under_review', 'reviewed'].includes(statusFilter)) {
    query = query.eq('status', statusFilter)
  }

  const { data: submissions, error: queryError } = await query

  if (queryError) {
    console.error('[admin] submissions query error:', queryError)
    throw new Error(`Failed to load submissions: ${queryError.message}`)
  }

  const counts = {
    all: submissions?.length ?? 0,
    submitted: submissions?.filter((s: { status: string }) => s.status === 'submitted').length ?? 0,
    under_review: submissions?.filter((s: { status: string }) => s.status === 'under_review').length ?? 0,
    reviewed: submissions?.filter((s: { status: string }) => s.status === 'reviewed').length ?? 0,
  }

  const tabs = [
    { label: 'All', value: undefined, count: counts.all },
    { label: 'Submitted', value: 'submitted', count: counts.submitted },
    { label: 'Under Review', value: 'under_review', count: counts.under_review },
    { label: 'Reviewed', value: 'reviewed', count: counts.reviewed },
  ]

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">Review and score user submissions</p>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => {
          const href = tab.value ? `/admin?status=${tab.value}` : '/admin'
          const isActive = statusFilter === tab.value

          return (
            <Link
              key={tab.label}
              href={href}
              className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors
                ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
                }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                  ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                {tab.count}
              </span>
            </Link>
          )
        })}
      </div>

      {!submissions || submissions.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-base font-medium text-gray-700">No submissions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(submissions as {
            id: string
            user_id: string
            status: string
            created_at: string
            task?: { id?: string; title?: string; field?: string; major?: string }
          }[]).map((sub) => (
            <div
              key={sub.id}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 text-sm truncate">
                    {sub.task?.title ?? 'Unknown task'}
                  </h3>
                  <span
                    className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[sub.status]}`}
                  >
                    {STATUS_LABELS[sub.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {[sub.task?.field, sub.task?.major].filter(Boolean).join(' · ') || '—'} ·{' '}
                  {new Date(sub.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {sub.task?.id && (
                  <Link
                    href={`/admin/tasks/${sub.task.id}/edit`}
                    className="text-sm border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Edit Task
                  </Link>
                )}
                <Link
                  href={`/admin/submissions/${sub.id}`}
                  className="text-sm bg-brand-50 hover:bg-brand-100 text-brand-700 font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Review →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
