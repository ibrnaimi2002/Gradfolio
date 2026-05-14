import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getProfilePageData } from '@/lib/services/profile'

export default async function AchievementsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { profile, badges, stats, skills } = await getProfilePageData(user.id)
  if (!profile) redirect('/onboarding')

  const earnedBadges = badges.filter((b) => b.earned)
  const lockedBadges = badges.filter((b) => !b.earned)

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-7 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/4 translate-x-1/4 pointer-events-none" />
        <div className="relative">
          <p className="text-brand-300 text-sm font-medium mb-1">Your progress</p>
          <h1 className="text-2xl font-extrabold mb-1">Achievements</h1>
          <p className="text-brand-200 text-sm">
            {earnedBadges.length} of {badges.length} badges earned
          </p>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full progress-fill"
                style={{ width: `${Math.round((earnedBadges.length / badges.length) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-brand-300 mt-1.5">
              {Math.round((earnedBadges.length / badges.length) * 100)}% complete
            </p>
          </div>
        </div>
      </div>

      {/* Stats snapshot */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tasks Done', value: stats.reviewedCount, icon: '✅', color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
          { label: 'Best Score', value: stats.maxScore ?? '—', icon: '🏆', color: 'text-amber-700 bg-amber-50 border-amber-100' },
          { label: 'Skills', value: skills.length, icon: '🧩', color: 'text-brand-700 bg-brand-50 border-brand-100' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`border rounded-2xl p-4 text-center ${color}`}>
            <p className="text-xl mb-1">{icon}</p>
            <p className="text-2xl font-extrabold">{value}</p>
            <p className="text-xs font-semibold opacity-70 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Earned badges */}
      {earnedBadges.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="text-lg">🏅</span> Earned
            <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
              {earnedBadges.length}
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {earnedBadges.map((badge) => (
              <div
                key={badge.key}
                className="rounded-2xl p-5 text-center border bg-gradient-to-b from-brand-50 to-white border-brand-200 shadow-sm badge-earned"
              >
                <p className="text-4xl mb-2.5">{badge.icon}</p>
                <p className="text-xs font-bold text-brand-700">{badge.label}</p>
                <p className="text-xs text-gray-400 mt-1 leading-tight">{badge.description}</p>
                <div className="mt-3 inline-flex items-center gap-1 bg-brand-100 text-brand-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  ✓ Earned
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked badges */}
      {lockedBadges.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="text-lg">🔒</span> Locked
            <span className="text-xs bg-gray-100 text-gray-500 border border-gray-200 px-2.5 py-0.5 rounded-full font-bold">
              {lockedBadges.length}
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {lockedBadges.map((badge) => (
              <div
                key={badge.key}
                className="rounded-2xl p-5 text-center border bg-gray-50 border-gray-100 opacity-60"
              >
                <p className="text-4xl mb-2.5 grayscale">{badge.icon}</p>
                <p className="text-xs font-bold text-gray-500">{badge.label}</p>
                <p className="text-xs text-gray-400 mt-1 leading-tight">{badge.description}</p>
                <div className="mt-3 inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full">
                  🔒 Locked
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA if no tasks done yet */}
      {stats.reviewedCount === 0 && (
        <div className="text-center bg-brand-50 border border-brand-100 rounded-2xl p-8">
          <p className="text-3xl mb-3">🚀</p>
          <p className="text-sm font-bold text-brand-800 mb-1">Start earning achievements</p>
          <p className="text-sm text-brand-600 mb-4">
            Complete and get reviewed on tasks to unlock badges.
          </p>
          <Link
            href="/tasks"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
          >
            Browse Tasks →
          </Link>
        </div>
      )}

    </div>
  )
}
