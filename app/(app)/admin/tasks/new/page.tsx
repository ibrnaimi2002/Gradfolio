import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import CreateTaskForm from '@/components/admin/CreateTaskForm'
import { createTask } from './actions'

export default async function NewTaskPage() {
  const user = await getCurrentUser()
  if (!isAdmin(user)) redirect('/dashboard')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-brand-600 transition-colors"
        >
          ← Back to Admin
        </Link>
        <h2 className="text-lg font-semibold text-gray-900 mt-3">Create Task</h2>
        <p className="text-sm text-gray-500 mt-1">
          Add a new task for users to complete
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <CreateTaskForm action={createTask} submitLabel="Create Task" redirectTo="/tasks" />
      </div>
    </div>
  )
}
