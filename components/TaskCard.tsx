import Link from 'next/link'
import { Task } from '@/types'

interface TaskCardProps {
  task: Task
  submitted?: boolean
}

function formatDeadline(deadline: string) {
  const date = new Date(deadline)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days < 0) return { label: 'Expired', color: 'text-red-500' }
  if (days === 0) return { label: 'Due today', color: 'text-orange-500' }
  if (days === 1) return { label: '1 day left', color: 'text-orange-500' }
  if (days <= 7) return { label: `${days} days left`, color: 'text-yellow-600' }
  return {
    label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    color: 'text-gray-500',
  }
}

export default function TaskCard({ task, submitted }: TaskCardProps) {
  const deadline = formatDeadline(task.deadline)

  return (
    <Link href={`/tasks/${task.id}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-brand-400 hover:shadow-md transition-all cursor-pointer group">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors leading-snug">
            {task.title}
          </h3>
          {submitted && (
            <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              Submitted
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {task.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {task.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
          <span className={`text-xs font-medium ${deadline.color}`}>
            {deadline.label}
          </span>
        </div>
      </div>
    </Link>
  )
}
