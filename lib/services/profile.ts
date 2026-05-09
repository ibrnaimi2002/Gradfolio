import { createClient } from '@/lib/supabase/server'
import { computeBadges, EarnedBadge } from '@/lib/badges'

export interface ProfileRecord {
  id: string
  field: string
  major: string
  display_name: string | null
  bio: string | null
  created_at: string
}

export interface ReviewedSubmission {
  id: string
  status: string
  content: string
  created_at: string
  task_id: string
  task: {
    id: string
    title: string
    field: string
    major: string
    skills: string[]
  } | null
  review: {
    score: number
    feedback: string
    reviewed_at: string
  } | null
}

export interface ProfileStats {
  totalSubmissions: number
  reviewedCount: number
  pendingCount: number
  avgScore: number | null
  maxScore: number
  strongestSkill: string | null
}

export async function getProfilePageData(userId: string): Promise<{
  profile: ProfileRecord | null
  reviewed: ReviewedSubmission[]
  stats: ProfileStats
  skills: string[]
  badges: EarnedBadge[]
}> {
  const supabase = createClient()

  const [profileResult, submissionsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase
      .from('submissions')
      .select(
        'id, status, content, created_at, task_id, task:tasks(id, title, field, major, skills), review:reviews(score, feedback, reviewed_at)'
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ])

  const profile = profileResult.data as ProfileRecord | null
  const allSubmissions = (submissionsResult.data ?? []) as unknown as ReviewedSubmission[]

  const reviewed = allSubmissions.filter(
    (s) => s.status === 'reviewed' && s.review
  )
  const scores = reviewed
    .map((s) => s.review?.score)
    .filter((s): s is number => s != null)

  // Strongest skill = most frequent across completed tasks
  const skillFreq: Record<string, number> = {}
  reviewed.forEach((s) => {
    s.task?.skills?.forEach((skill) => {
      skillFreq[skill] = (skillFreq[skill] ?? 0) + 1
    })
  })
  const strongestSkill =
    Object.entries(skillFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const stats: ProfileStats = {
    totalSubmissions: allSubmissions.length,
    reviewedCount: reviewed.length,
    pendingCount: allSubmissions.filter((s) => s.status !== 'reviewed').length,
    avgScore: scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null,
    maxScore: scores.length ? Math.max(...scores) : 0,
    strongestSkill,
  }

  const skills = Array.from(new Set(reviewed.flatMap((s) => s.task?.skills ?? [])))
  const badges = computeBadges(stats)

  return { profile, reviewed, stats, skills, badges }
}
