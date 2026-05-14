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

  // Count from full list (re-fetch without filter for accurate counts)
  const { data: all } = await supabase
    .from('submissions')
    .select('status')
  const totalCounts = {
    all: all?.length ?? 0,
    submitted: all?.filter((s) => s.status === 'submitted').length ?? 0,
    under_review: all?.filter((s) => s.status === 'under_review').length ?? 0,
    reviewed: all?.filter((s) => s.status === 'reviewed').length ?? 0,
  }

  const tabs = [
    { label: 'All', value: undefined, count: totalCounts.all },
    { label: 'New', value: 'submitted', count: totalCounts.submitted },
    { label: 'Under Review', value: 'under_review', count: totalCounts.under_review },
    { label: 'Reviewed', value: 'reviewed', count: totalCounts.reviewed },
  ]

  const STATUS_DOT: Record<string, string> = {
    submitted: 'bg-brand-500',
    under_review: 'bg-amber-500',
    reviewed: 'bg-emerald-500',
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => {
          const href = tab.value ? `/admin?status=${tab.value}` : '/admin'
          const active = statusFilter === tab.value

          return (
            <Link
              key={tab.label}
              href={href}
              className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-all duration-150 ${
                active
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white border-gray-100 text-gray-600 hover:border-brand-200 hover:text-brand-700 hover:bg-brand-50'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center
                  ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                {tab.count}
              </span>
            </Link>
          )
        })}
      </div>

      {!submissions || submissions.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-card">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-base font-bold text-gray-700">No submissions found</p>
          <p className="text-sm text-gray-400 mt-1">
            {statusFilter ? `No ${STATUS_LABELS[statusFilter]?.toLowerCase() ?? statusFilter} submissions` : 'No submissions yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {(submissions as {
            id: string
            user_id: string
            status: string
            created_at: string
            task?: { id?: string; title?: string; field?: string; major?: string }
          }[]).map((sub) => (
            <div
              key={sub.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-card hover:shadow-card-hover transition-all duration-200"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {/* Status dot */}
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${STATUS_DOT[sub.status] ?? 'bg-gray-300'}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-sm truncate">
                      {sub.task?.title ?? 'Unknown task'}
                    </h3>
                    <span className={`shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[sub.status]}`}>
                      {STATUS_LABELS[sub.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {[sub.task?.field, sub.task?.major].filter(Boolean).join(' · ') || '—'} ·{' '}
                    {new Date(sub.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {sub.task?.id && (
                  <Link
                    href={`/admin/tasks/${sub.task.id}/edit`}
                    className="text-xs border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 font-semibold px-3 py-2 rounded-xl transition-all duration-150"
                  >
                    Edit Task
                  </Link>
                )}
                <Link
                  href={`/admin/submissions/${sub.id}`}
                  className="text-xs bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md"
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
