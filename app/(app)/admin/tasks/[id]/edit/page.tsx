import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import CreateTaskForm from '@/components/admin/CreateTaskForm'
import { updateTask } from './actions'

export default async function EditTaskPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()
  if (!isAdmin(user)) redirect('/dashboard')

  const supabase = createAdminClient()
  const { data: task, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) console.error('[EditTaskPage] fetch error:', error)
  if (!task) notFound()

  const boundUpdate = updateTask.bind(null, params.id)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-brand-600 transition-colors"
        >
          ← Back to Admin
        </Link>
        <h2 className="text-lg font-semibold text-gray-900 mt-3">Edit Task</h2>
        <p className="text-sm text-gray-500 mt-1">
          Update the task details below
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <CreateTaskForm
          action={boundUpdate}
          initialValues={task}
          submitLabel="Update Task"
          redirectTo="/admin"
        />
      </div>
    </div>
  )
}
