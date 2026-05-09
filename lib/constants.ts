export const FIELDS = ['IT', 'Business', 'Design'] as const
export type Field = (typeof FIELDS)[number]

export const MAJORS: Record<string, string[]> = {
  IT: ['Cybersecurity', 'Data Analysis', 'Software Development'],
  Business: ['Marketing', 'Finance'],
  Design: ['Graphic Design', 'UI/UX'],
}

// Canonical alias — use this everywhere in V2
export const MAJORS_BY_FIELD = MAJORS

export const ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gradfolio.com'

export const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  reviewed: 'Reviewed',
}

export const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  reviewed: 'bg-emerald-100 text-emerald-700',
}

export interface BadgeDefinition {
  key: string
  label: string
  description: string
  icon: string
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    key: 'first_submission',
    label: 'First Step',
    description: 'Submitted your first task',
    icon: '🚀',
  },
  {
    key: 'three_completed',
    label: 'Getting Started',
    description: 'Completed 3 reviewed tasks',
    icon: '⭐',
  },
  {
    key: 'high_scorer',
    label: 'High Achiever',
    description: 'Scored 90 or above on a task',
    icon: '🏆',
  },
  {
    key: 'five_completed',
    label: 'Consistent',
    description: 'Completed 5 or more tasks',
    icon: '🔥',
  },
]
