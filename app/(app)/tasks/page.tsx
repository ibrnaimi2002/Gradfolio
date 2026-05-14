import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TaskCard from '@/components/TaskCard'

export default async function TasksPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('field', profile.field)
    .eq('major', profile.major)
    .order('deadline', { ascending: true })

  const { data: submissions } = await supabase
    .from('submissions')
    .select('task_id, status')
    .eq('user_id', user.id)

  const submittedTaskIds = new Set(submissions?.map((s) => s.task_id) ?? [])
  const reviewedTaskIds = new Set(
    submissions?.filter((s) => s.status === 'reviewed').map((s) => s.task_id) ?? []
  )

  const allTasks = tasks ?? []
  const available = allTasks.filter((t) => !submittedTaskIds.has(t.id))
  const inProgress = allTasks.filter((t) => submittedTaskIds.has(t.id) && !reviewedTaskIds.has(t.id))
  const completed = allTasks.filter((t) => reviewedTaskIds.has(t.id))

  const isEmpty = allTasks.length === 0

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Your Tasks</h1>
            <p className="text-sm text-gray-500 mt-1">
              {profile.major} · {profile.field}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-brand-50 text-brand-700 border border-brand-100 px-3 py-1.5 rounded-full font-semibold">
              {allTasks.length} task{allTasks.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        {allTasks.length > 0 && (
          <div className="mt-5 bg-white border border-gray-100 rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">Progress</span>
              <span className="text-xs text-gray-400">
                {completed.length} / {allTasks.length} completed
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full progress-fill transition-all"
                style={{ width: `${allTasks.length > 0 ? Math.round((completed.length / allTasks.length) * 100) : 0}%` }}
              />
            </div>
            <div className="flex gap-4 mt-3">
              {[
                { label: 'Available', count: available.length, color: 'bg-gray-100 text-gray-600' },
                { label: 'In Review', count: inProgress.length, color: 'bg-amber-100 text-amber-700' },
                { label: 'Completed', count: completed.length, color: 'bg-emerald-100 text-emerald-700' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.color}`}>
                    {s.count}
                  </span>
                  <span className="text-xs text-gray-400">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-card">
          <p className="text-4xl mb-4">📭</p>
          <h2 className="text-lg font-bold text-gray-700 mb-2">No tasks available yet</h2>
          <p className="text-sm text-gray-500">
            Check back soon — tasks are added regularly for {profile.major}.
          </p>
          <Link
            href="/settings"
            className="inline-block mt-4 text-sm text-brand-600 hover:text-brand-700 font-semibold"
          >
            Change your major →
          </Link>
        </div>
      ) : (
        <div className="space-y-10">

          {/* Available */}
          {available.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-bold text-gray-900">Available</h2>
                <span className="text-xs bg-brand-50 text-brand-600 border border-brand-100 px-2.5 py-0.5 rounded-full font-semibold">
                  {available.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {available.map((task) => (
                  <TaskCard key={task.id} task={task} submitted={false} />
                ))}
              </div>
            </section>
          )}

          {/* In Review */}
          {inProgress.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-bold text-gray-900">Submitted & Under Review</h2>
                <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full font-semibold">
                  {inProgress.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgress.map((task) => (
                  <TaskCard key={task.id} task={task} submitted={true} />
                ))}
              </div>
            </section>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-bold text-gray-900">Completed</h2>
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full font-semibold">
                  {completed.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-80">
                {completed.map((task) => (
                  <TaskCard key={task.id} task={task} submitted={true} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  )
}
