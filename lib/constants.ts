export const FIELDS = ['IT', 'Business', 'Design'] as const
export type Field = (typeof FIELDS)[number]

export const MAJORS: Record<string, string[]> = {
  IT: ['Cybersecurity', 'Data Analysis', 'Software Development'],
  Business: ['Marketing', 'Finance'],
  Design: ['Graphic Design', 'UI/UX'],
}

export const ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gradfolio.com'

export const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  reviewed: 'Reviewed',
}

export const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  reviewed: 'bg-green-100 text-green-700',
}
