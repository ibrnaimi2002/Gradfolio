import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getProfilePageData } from '@/lib/services/profile'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  accent: 'emerald' | 'brand' | 'amber' | 'purple'
}) {
  const colors = {
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    brand: 'bg-brand-50 border-brand-100 text-brand-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
  }
  const valueColors = {
    emerald: 'text-emerald-700',
    brand: 'text-brand-700',
    amber: 'text-amber-700',
    purple: 'text-purple-700',
  }
  return (
    <div className={`border rounded-xl p-4 ${colors[accent]}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueColors[accent]}`}>{value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  )
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { profile, reviewed, stats, skills, badges } =
    await getProfilePageData(user.id)

  if (!profile) redirect('/onboarding')

  const displayName =
    profile.display_name || user.email?.split('@')[0] || 'User'
  const earnedBadges = badges.filter((b) => b.earned)

  // Determine next step recommendation
  let nextStep: { text: string; href: string; cta: string }
  if (stats.totalSubmissions === 0) {
    nextStep = {
      text: 'You haven\'t submitted any tasks yet. Start building your portfolio!',
      href: '/tasks',
      cta: 'Browse Tasks',
    }
  } else if (stats.pendingCount > 0) {
    nextStep = {
      text: `You have ${stats.pendingCount} submission${stats.pendingCount > 1 ? 's' : ''} awaiting review. Check back soon or submit another.`,
      href: '/tasks',
      cta: 'Submit Another',
    }
  } else {
    nextStep = {
      text: 'Great work! Keep submitting tasks to grow your skills and earn more badges.',
      href: '/tasks',
      cta: 'Find New Tasks',
    }
  }

  // Last 5 submissions for activity feed — fetch separately to avoid re-fetching
  // We'll derive from the reviewed list + a full submissions query via profile service
  // For now, use reviewed as the activity source (already ordered by created_at desc)
  const recentActivity = reviewed.slice(0, 5)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {displayName}!
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {profile.major} · {profile.field}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Completed"
          value={stats.reviewedCount}
          sub="tasks reviewed"
          accent="emerald"
        />
        <StatCard
          label="Avg Score"
          value={stats.avgScore !== null ? stats.avgScore : '—'}
          sub="out of 100"
          accent="brand"
        />
        <StatCard
          label="In Review"
          value={stats.pendingCount}
          sub="pending"
          accent="amber"
        />
        <StatCard
          label="Badges"
          value={`${earnedBadges.length}/${badges.length}`}
          sub="earned"
          accent="purple"
        />
      </div>

      {/* Next step banner */}
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <p className="text-sm text-brand-800 leading-relaxed">{nextStep.text}</p>
        </div>
        <Link
          href={nextStep.href}
          className="shrink-0 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {nextStep.cta}
        </Link>
      </div>

      {/* Achievements */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Achievements</h2>
          <span className="text-xs text-gray-400">
            {earnedBadges.length} of {badges.length} earned
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.key}
              className={`rounded-xl p-4 text-center border transition-all ${
                badge.earned
                  ? 'bg-brand-50 border-brand-100'
                  : 'bg-gray-50 border-gray-100 opacity-40'
              }`}
            >
              <p className="text-3xl mb-2">{badge.icon}</p>
              <p
                className={`text-xs font-semibold ${badge.earned ? 'text-brand-700' : 'text-gray-400'}`}
              >
                {badge.label}
              </p>
              <p className="text-xs text-gray-400 mt-1 leading-tight">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Skills + Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Skills */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Skills Demonstrated
          </h2>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium border border-brand-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">
              Complete reviewed tasks to see your skills here.
            </p>
          )}
        </div>

        {/* Quick links */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Quick Links
          </h2>
          <div className="space-y-2">
            {[
              { label: 'Browse Tasks', href: '/tasks', icon: '📋' },
              { label: 'View Portfolio', href: '/profile', icon: '🗂️' },
              { label: 'Edit Profile', href: '/profile', icon: '✏️' },
              { label: 'Settings', href: '/settings', icon: '⚙️' },
            ].map(({ label, href, icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2.5 text-sm text-gray-700 hover:text-brand-700 hover:bg-brand-50 px-3 py-2 rounded-lg transition-colors"
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Recent Activity
          </h2>
          <Link
            href="/profile"
            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            View all →
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-sm font-medium text-gray-700">No activity yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Submit a task to see your progress here
            </p>
            <Link
              href="/tasks"
              className="inline-block mt-4 text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Browse Tasks →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((sub) => (
              <div
                key={sub.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {sub.task?.title}
                    </p>
                    <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Reviewed
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(sub.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                {sub.review && (
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center">
                    <span className="text-base font-bold text-emerald-700 leading-none">
                      {sub.review.score}
                    </span>
                    <span className="text-xs text-emerald-500">/100</span>
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
