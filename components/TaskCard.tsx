import Link from 'next/link'
import { Task } from '@/types'

interface TaskCardProps {
  task: Task
  submitted?: boolean
}

function formatDeadline(deadline: string) {
  const date = new Date(deadline)
  const days = Math.ceil((date.getTime() - Date.now()) / 86400000)

  if (days < 0) return { label: 'Expired', color: 'text-red-500 bg-red-50 border-red-100' }
  if (days === 0) return { label: 'Due today', color: 'text-orange-600 bg-orange-50 border-orange-100' }
  if (days === 1) return { label: '1 day left', color: 'text-orange-500 bg-orange-50 border-orange-100' }
  if (days <= 7) return { label: `${days} days left`, color: 'text-yellow-600 bg-yellow-50 border-yellow-100' }
  return {
    label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    color: 'text-gray-500 bg-gray-50 border-gray-100',
  }
}

const TYPE_ICONS: Record<string, string> = {
  file: '📎',
  link: '🔗',
  text: '✍️',
}

export default function TaskCard({ task, submitted }: TaskCardProps) {
  const deadline = formatDeadline(task.deadline)
  const typeIcon = TYPE_ICONS[task.submission_type] ?? '📝'

  return (
    <Link href={`/tasks/${task.id}`} className="block group">
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors leading-snug text-sm flex-1">
            {task.title}
          </h3>
          {submitted ? (
            <span className="shrink-0 text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
              ✓ Done
            </span>
          ) : null}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {task.description}
        </p>

        {/* Skills */}
        {task.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {task.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-xs bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full border border-brand-100 font-medium"
              >
                {skill}
              </span>
            ))}
            {task.skills.length > 3 && (
              <span className="text-xs text-gray-400 px-1.5 py-0.5">
                +{task.skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{typeIcon}</span>
            <span className="text-xs text-gray-400 font-medium capitalize">{task.submission_type}</span>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${deadline.color}`}>
            {deadline.label}
          </span>
        </div>

      </div>
    </Link>
  )
}
