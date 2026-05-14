import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getProfilePageData } from '@/lib/services/profile'
import { createClient } from '@/lib/supabase/server'

const MOTIVATING_MESSAGES = [
  'Keep building your proof of skills.',
  'Every task completed is a step forward.',
  'Your portfolio grows with every submission.',
  'Real work beats a CV every time.',
]

function ScoreRing({ score }: { score: number | null }) {
  if (score === null) return (
    <div className="text-center">
      <p className="text-3xl font-extrabold text-white">—</p>
      <p className="text-brand-300 text-xs mt-0.5">Avg Score</p>
    </div>
  )
  const color = score >= 80 ? 'text-emerald-300' : score >= 60 ? 'text-yellow-300' : 'text-orange-300'
  return (
    <div className="text-center">
      <p className={`text-3xl font-extrabold ${color}`}>{score}</p>
      <p className="text-brand-300 text-xs mt-0.5">Avg Score</p>
    </div>
  )
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = createClient()
  const { profile, reviewed, stats, skills, badges } = await getProfilePageData(user.id)
  if (!profile) redirect('/onboarding')

  const displayName = profile.display_name || user.email?.split('@')[0] || 'User'
  const earnedBadges = badges.filter((b) => b.earned)
  const motivatingMsg = MOTIVATING_MESSAGES[Math.floor(Math.random() * MOTIVATING_MESSAGES.length)]

  // Fetch submitted task IDs for recommendations
  const { data: submissions } = await supabase
    .from('submissions')
    .select('task_id')
    .eq('user_id', user.id)
  const submittedTaskIds = new Set(submissions?.map((s) => s.task_id) ?? [])

  // Fetch recommended tasks (not yet submitted)
  const { data: allTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('field', profile.field)
    .eq('major', profile.major)
    .order('deadline', { ascending: true })

  const recommendedTasks = (allTasks ?? [])
    .filter((t) => !submittedTaskIds.has(t.id))
    .slice(0, 3)

  // Next pending submitted (awaiting review)
  const pendingSubmission = submissions?.find(
    (s) => !reviewed.find((r) => r.task_id === s.task_id)
  )

  // Skill frequency for progress bars
  const skillFreq: Record<string, number> = {}
  for (const sub of reviewed) {
    for (const sk of sub.task?.skills ?? []) {
      skillFreq[sk] = (skillFreq[sk] ?? 0) + 1
    }
  }
  const maxFreq = Math.max(1, ...Object.values(skillFreq))
  const skillBars = Object.entries(skillFreq)
    .map(([skill, count]) => ({
      skill,
      percent: Math.max(15, Math.round((count / maxFreq) * 100)),
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5)

  // Next step
  let nextStep: { text: string; href: string; cta: string; icon: string }
  if (stats.totalSubmissions === 0) {
    nextStep = { text: "You haven't submitted any tasks yet. Start building your portfolio!", href: '/tasks', cta: 'Browse Tasks', icon: '🚀' }
  } else if (stats.pendingCount > 0) {
    nextStep = { text: `You have ${stats.pendingCount} submission${stats.pendingCount > 1 ? 's' : ''} under review. Submit another while you wait.`, href: '/tasks', cta: 'Submit Another', icon: '⏳' }
  } else {
    nextStep = { text: 'Great work! Keep submitting tasks to grow your skills and earn more badges.', href: '/tasks', cta: 'Find New Tasks', icon: '💡' }
  }

  const recentActivity = reviewed.slice(0, 5)

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── SECTION 1: Hero Card ── */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-6 sm:p-8 shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-16 w-40 h-40 rounded-full bg-white/5 translate-y-1/2 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-brand-300 text-sm font-medium mb-1">Welcome back</p>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{displayName}</h1>
            <p className="text-brand-300 mt-1.5 text-sm">
              {profile.major} · {profile.field}
            </p>
            <p className="text-brand-200/80 text-sm mt-4 italic font-medium">
              &ldquo;{motivatingMsg}&rdquo;
            </p>
          </div>

          <div className="flex sm:flex-col gap-4 sm:gap-3 shrink-0">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
              <p className="text-2xl font-extrabold text-white">{stats.reviewedCount}</p>
              <p className="text-brand-300 text-xs mt-0.5 font-medium">Tasks Done</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
              <ScoreRing score={stats.avgScore} />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Stats Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Tasks Completed',
            value: stats.reviewedCount,
            sub: 'reviewed',
            icon: '✅',
            bg: 'bg-emerald-50 border-emerald-100',
            text: 'text-emerald-700',
            val: 'text-emerald-700',
          },
          {
            label: 'Average Score',
            value: stats.avgScore !== null ? `${stats.avgScore}` : '—',
            sub: 'out of 100',
            icon: '📈',
            bg: 'bg-brand-50 border-brand-100',
            text: 'text-brand-600',
            val: 'text-brand-700',
          },
          {
            label: 'Under Review',
            value: stats.pendingCount,
            sub: 'pending',
            icon: '🔍',
            bg: 'bg-amber-50 border-amber-100',
            text: 'text-amber-600',
            val: 'text-amber-700',
          },
          {
            label: 'Achievements',
            value: `${earnedBadges.length}/${badges.length}`,
            sub: 'earned',
            icon: '🏆',
            bg: 'bg-purple-50 border-purple-100',
            text: 'text-purple-600',
            val: 'text-purple-700',
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} border rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover`}
          >
            <div className="flex items-start justify-between mb-2">
              <p className={`text-xs font-semibold opacity-70 ${s.text}`}>{s.label}</p>
              <span className="text-base">{s.icon}</span>
            </div>
            <p className={`text-2xl font-extrabold ${s.val}`}>{s.value}</p>
            <p className={`text-xs opacity-60 mt-0.5 ${s.text}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── SECTION 3: Continue Growing ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card flex items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-xl shrink-0">
            {nextStep.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-0.5">Continue Growing</p>
            <p className="text-sm text-gray-500 leading-relaxed">{nextStep.text}</p>
          </div>
        </div>
        <Link
          href={nextStep.href}
          className="shrink-0 text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md whitespace-nowrap"
        >
          {nextStep.cta}
        </Link>
      </div>

      {/* ── SECTION 4: Recommended Tasks ── */}
      {recommendedTasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recommended for You</h2>
            <Link href="/tasks" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recommendedTasks.map((task) => {
              const deadline = new Date(task.deadline)
              const days = Math.ceil((deadline.getTime() - Date.now()) / 86400000)
              const dLabel = days < 0 ? 'Expired' : days === 0 ? 'Due today' : `${days}d left`
              const dColor = days < 0 ? 'text-red-500' : days <= 1 ? 'text-orange-500' : days <= 7 ? 'text-yellow-600' : 'text-gray-400'
              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group block"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
                      {task.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(task.skills ?? []).slice(0, 2).map((sk: string) => (
                      <span key={sk} className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-100">
                        {sk}
                      </span>
                    ))}
                  </div>
                  <p className={`text-xs font-semibold ${dColor}`}>{dLabel}</p>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── SECTION 5: Skill Growth ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">Skill Growth</h2>
          <span className="text-xs text-gray-400">{skills.length} skills demonstrated</span>
        </div>

        {skillBars.length > 0 ? (
          <div className="space-y-4">
            {skillBars.map(({ skill, percent }) => (
              <div key={skill}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{skill}</span>
                  <span className="text-xs font-semibold text-brand-600">{percent}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full progress-fill"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {['Complete tasks', 'Get reviewed', 'Earn skills'].map((placeholder, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-300">{placeholder}</span>
                  <span className="text-xs text-gray-200">—%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full" />
              </div>
            ))}
            <p className="text-xs text-gray-400 text-center pt-1">
              Complete and get reviewed on tasks to see skill progress
            </p>
          </div>
        )}
      </div>

      {/* ── SECTION 6: Achievements ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">Achievements</h2>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: badges.length }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${i < earnedBadges.length ? 'bg-brand-500' : 'bg-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {earnedBadges.length}/{badges.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.key}
              className={`rounded-2xl p-4 text-center border transition-all duration-200 ${
                badge.earned
                  ? 'bg-gradient-to-b from-brand-50 to-white border-brand-200 shadow-sm badge-earned'
                  : 'bg-gray-50 border-gray-100 opacity-40'
              }`}
            >
              <p className={`text-3xl mb-2 ${badge.earned ? '' : 'grayscale'}`}>{badge.icon}</p>
              <p className={`text-xs font-bold ${badge.earned ? 'text-brand-700' : 'text-gray-400'}`}>
                {badge.label}
              </p>
              <p className="text-xs text-gray-400 mt-1 leading-tight">{badge.description}</p>
              {badge.earned && (
                <div className="mt-2 inline-flex items-center gap-1 bg-brand-100 text-brand-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  ✓ Earned
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 7: Recent Activity ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Recent Activity</h2>
          <Link href="/profile" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            View all →
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <div className="text-center py-14 bg-white border border-gray-100 rounded-2xl shadow-card">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm font-semibold text-gray-700">No activity yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Submit a task to see your progress here
            </p>
            <Link
              href="/tasks"
              className="inline-block mt-4 text-sm text-brand-600 hover:text-brand-700 font-semibold"
            >
              Browse Tasks →
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentActivity.map((sub) => (
              <div
                key={sub.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-card hover:shadow-card-hover transition-all duration-200"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-base shrink-0">
                    ✅
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {sub.task?.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Reviewed ·{' '}
                      {new Date(sub.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                {sub.review && (
                  <div className="shrink-0 text-center min-w-[52px]">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center">
                      <span className="text-base font-extrabold text-emerald-700 leading-none">
                        {sub.review.score}
                      </span>
                      <span className="text-[10px] text-emerald-500 font-medium">/100</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
