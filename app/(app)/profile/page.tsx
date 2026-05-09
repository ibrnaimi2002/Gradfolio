import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getProfilePageData } from '@/lib/services/profile'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'
import EditProfileForm from '@/components/profile/EditProfileForm'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { profile, reviewed, stats, skills, badges } =
    await getProfilePageData(user.id)

  if (!profile) redirect('/onboarding')

  const displayName =
    profile.display_name || user.email?.split('@')[0] || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()
  const earnedBadges = badges.filter((b) => b.earned)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xl font-bold shrink-0 select-none">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {profile.major} · {profile.field}
            </p>
            {profile.bio ? (
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {profile.bio}
              </p>
            ) : (
              <p className="text-sm text-gray-400 mt-2 italic">
                No bio yet — add one below
              </p>
            )}
          </div>
        </div>

        <div className="mt-5">
          <EditProfileForm
            initialDisplayName={profile.display_name ?? ''}
            initialBio={profile.bio ?? ''}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Completed', value: stats.reviewedCount, sub: 'tasks reviewed' },
          {
            label: 'Avg Score',
            value: stats.avgScore !== null ? stats.avgScore : '—',
            sub: 'out of 100',
          },
          { label: 'In Review', value: stats.pendingCount, sub: 'pending' },
          {
            label: 'Top Skill',
            value: stats.strongestSkill ?? '—',
            sub: '',
          },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="bg-white border border-gray-200 rounded-xl p-4"
          >
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
        ))}
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

      {/* Skills */}
      {skills.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Skills Demonstrated
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="text-sm bg-brand-50 text-brand-700 px-3 py-1.5 rounded-full font-medium border border-brand-100"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Portfolio
          </h2>
          <span className="text-xs text-gray-400">
            {reviewed.length} completed {reviewed.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {reviewed.length === 0 ? (
          <div className="text-center py-14 bg-white border border-gray-200 rounded-2xl">
            <p className="text-3xl mb-3">📂</p>
            <p className="text-sm font-medium text-gray-700">
              No completed tasks yet
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Complete tasks to build your portfolio
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
            {reviewed.map((sub) => (
              <div
                key={sub.id}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {sub.task?.title}
                      </h3>
                      <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Reviewed
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mb-2">
                      {sub.task?.field} · {sub.task?.major} ·{' '}
                      {new Date(sub.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>

                    {sub.task?.skills && sub.task.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {sub.task.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {sub.review?.feedback && (
                      <p className="text-xs text-gray-500 italic line-clamp-2 mt-1">
                        &ldquo;{sub.review.feedback}&rdquo;
                      </p>
                    )}
                  </div>

                  {sub.review && (
                    <div className="shrink-0 text-center">
                      <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-emerald-700">
                          {sub.review.score}
                        </span>
                        <span className="text-xs text-emerald-500">/100</span>
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
