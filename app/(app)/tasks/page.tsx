import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TaskCard from '@/components/TaskCard'

export default async function TasksPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  // Fetch tasks matching user's field & major
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('field', profile.field)
    .eq('major', profile.major)
    .order('deadline', { ascending: true })

  // Fetch user's submissions to mark submitted tasks
  const { data: submissions } = await supabase
    .from('submissions')
    .select('task_id')
    .eq('user_id', user.id)

  const submittedTaskIds = new Set(submissions?.map((s) => s.task_id) ?? [])

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Tasks</h1>
            <p className="text-sm text-gray-500 mt-1">
              {profile.major} · {profile.field}
            </p>
          </div>
          <span className="text-sm text-gray-500">
            {tasks?.length ?? 0} task{tasks?.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {!tasks || tasks.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📭</p>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            No tasks available yet
          </h2>
          <p className="text-sm text-gray-500">
            Check back soon — tasks are added regularly for {profile.major}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              submitted={submittedTaskIds.has(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
