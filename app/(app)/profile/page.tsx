import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getProfilePageData } from '@/lib/services/profile'
import EditProfileForm from '@/components/profile/EditProfileForm'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { profile, reviewed, stats, skills, badges } = await getProfilePageData(user.id)
  if (!profile) redirect('/onboarding')

  const displayName = profile.display_name || user.email?.split('@')[0] || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()
  const earnedBadges = badges.filter((b) => b.earned)

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Profile Header ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 relative">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-8 w-16 h-16 rounded-full bg-white/30 blur-lg" />
            <div className="absolute bottom-1 right-16 w-24 h-24 rounded-full bg-white/20 blur-xl" />
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* Avatar overlapping banner */}
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xl font-extrabold shrink-0 select-none ring-4 ring-white shadow-md">
              {initials}
            </div>
            <EditProfileForm
              initialDisplayName={profile.display_name ?? ''}
              initialBio={profile.bio ?? ''}
            />
          </div>

          <h1 className="text-xl font-extrabold text-gray-900">{displayName}</h1>
          <p className="text-sm text-gray-400 mt-0.5 font-medium">
            {profile.major} · {profile.field}
          </p>
          {profile.bio ? (
            <p className="text-sm text-gray-600 mt-3 leading-relaxed max-w-lg">
              {profile.bio}
            </p>
          ) : (
            <p className="text-sm text-gray-300 mt-3 italic">
              No bio yet — click &ldquo;Edit Profile&rdquo; to add one
            </p>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tasks Completed', value: stats.reviewedCount, icon: '✅', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Avg Score', value: stats.avgScore !== null ? stats.avgScore : '—', icon: '📈', color: 'text-brand-700', bg: 'bg-brand-50 border-brand-100' },
          { label: 'Skills', value: skills.length, icon: '🧩', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-100' },
          { label: 'Top Skill', value: stats.strongestSkill ?? '—', icon: '🏅', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className={`${bg} border rounded-2xl p-4 hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200`}>
            <div className="flex items-start justify-between mb-2">
              <p className={`text-xs font-semibold opacity-70 ${color}`}>{label}</p>
              <span className="text-base">{icon}</span>
            </div>
            <p className={`text-xl font-extrabold truncate ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Skills ── */}
      {skills.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
          <h2 className="font-bold text-gray-900 mb-4">Skills Demonstrated</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="text-sm bg-brand-50 text-brand-700 px-3.5 py-1.5 rounded-full font-semibold border border-brand-100 hover:bg-brand-100 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Achievements ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">Achievements</h2>
          <span className="text-xs text-gray-400 font-medium bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
            {earnedBadges.length} / {badges.length} earned
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.key}
              className={`rounded-2xl p-4 text-center border transition-all duration-200 ${
                badge.earned
                  ? 'bg-gradient-to-b from-brand-50 to-white border-brand-200 shadow-sm badge-earned'
                  : 'bg-gray-50 border-gray-100 opacity-40 grayscale'
              }`}
            >
              <p className="text-3xl mb-2">{badge.icon}</p>
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

      {/* ── Portfolio ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Portfolio</h2>
          <span className="text-xs text-gray-400 font-medium bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
            {reviewed.length} completed {reviewed.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {reviewed.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-card">
            <p className="text-4xl mb-3">🗂️</p>
            <p className="text-sm font-bold text-gray-700">No completed tasks yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Complete and get reviewed on tasks to build your portfolio
            </p>
            <Link
              href="/tasks"
              className="inline-block mt-5 text-sm text-brand-600 hover:text-brand-700 font-semibold"
            >
              Browse Tasks →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reviewed.map((sub) => (
              <div
                key={sub.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm truncate">
                        {sub.task?.title}
                      </h3>
                      <span className="shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        ✓ Reviewed
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mb-3">
                      {sub.task?.field} · {sub.task?.major} ·{' '}
                      {new Date(sub.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>

                    {sub.task?.skills && sub.task.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {sub.task.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="text-xs bg-gray-50 text-gray-600 px-2.5 py-0.5 rounded-full border border-gray-100 font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {sub.review?.feedback && (
                      <p className="text-xs text-gray-500 italic line-clamp-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        &ldquo;{sub.review.feedback}&rdquo;
                      </p>
                    )}
                  </div>

                  {sub.review && (
                    <div className="shrink-0 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-200 flex flex-col items-center justify-center shadow-sm">
                        <span className="text-xl font-extrabold text-emerald-700 leading-none">
                          {sub.review.score}
                        </span>
                        <span className="text-[10px] text-emerald-500 font-semibold">/100</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
