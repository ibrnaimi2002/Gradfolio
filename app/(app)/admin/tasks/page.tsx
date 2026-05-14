import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const TYPE_ICONS: Record<string, string> = { file: '📎', link: '🔗', text: '✍️' }
const TYPE_COLORS: Record<string, string> = {
  file: 'bg-purple-50 text-purple-700 border-purple-100',
  link: 'bg-blue-50 text-blue-700 border-blue-100',
  text: 'bg-gray-50 text-gray-600 border-gray-100',
}

export default async function AdminTasksPage() {
  const user = await getCurrentUser()
  if (!isAdmin(user)) redirect('/dashboard')

  const supabase = createAdminClient()
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, title, field, major, deadline, created_at, submission_type')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[AdminTasksPage] fetch error:', error)
    throw new Error(`Failed to load tasks: ${error.message}`)
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">
            {tasks?.length ?? 0} {tasks?.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>
        <Link
          href="/admin/tasks/new"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Task
        </Link>
      </div>

      {!tasks || tasks.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-card">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-base font-bold text-gray-700">No tasks yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first task to get started</p>
          <Link
            href="/admin/tasks/new"
            className="inline-block mt-5 text-sm text-brand-600 hover:text-brand-700 font-semibold"
          >
            Create Task →
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => {
            const deadline = task.deadline ? new Date(task.deadline) : null
            const days = deadline ? Math.ceil((deadline.getTime() - Date.now()) / 86400000) : null
            const isExpired = days !== null && days < 0

            return (
              <div
                key={task.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-card hover:shadow-card-hover transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-sm truncate">
                      {task.title}
                    </h3>
                    <span className={`shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${TYPE_COLORS[task.submission_type] ?? 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                      {TYPE_ICONS[task.submission_type] ?? '📝'} {task.submission_type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {[task.field, task.major].filter(Boolean).join(' · ')}
                    {task.deadline && (
                      <span className={`ml-2 font-medium ${isExpired ? 'text-red-400' : days !== null && days <= 7 ? 'text-amber-500' : 'text-gray-400'}`}>
                        · {isExpired ? 'Expired' : `Due ${new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      </span>
                    )}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="text-xs border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 font-semibold px-3 py-2 rounded-xl transition-all"
                  >
                    Preview
                  </Link>
                  <Link
                    href={`/admin/tasks/${task.id}/edit`}
                    className="text-xs bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold px-4 py-2 rounded-xl transition-all border border-brand-100"
                  >
                    Edit →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
