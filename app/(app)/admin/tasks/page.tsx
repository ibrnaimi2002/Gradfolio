import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

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
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          {tasks?.length ?? 0} {tasks?.length === 1 ? 'task' : 'tasks'}
        </p>
        <Link
          href="/admin/tasks/new"
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          + Create Task
        </Link>
      </div>

      {!tasks || tasks.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-base font-medium text-gray-700">No tasks yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first task to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 text-sm truncate">
                    {task.title}
                  </h3>
                  <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
                    {task.submission_type}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {[task.field, task.major].filter(Boolean).join(' · ')}
                  {task.deadline && (
                    <>
                      {' · Due '}
                      {new Date(task.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </>
                  )}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Link
                  href={`/tasks/${task.id}`}
                  className="text-sm border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  View
                </Link>
                <Link
                  href={`/admin/tasks/${task.id}/edit`}
                  className="text-sm bg-brand-50 hover:bg-brand-100 text-brand-700 font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Edit →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
