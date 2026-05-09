import { BADGE_DEFINITIONS, BadgeDefinition } from './constants'

interface StatsForBadges {
  totalSubmissions: number
  reviewedCount: number
  maxScore: number
}

export interface EarnedBadge extends BadgeDefinition {
  earned: boolean
}

export function computeBadges(stats: StatsForBadges): EarnedBadge[] {
  return BADGE_DEFINITIONS.map((badge) => {
    let earned = false
    switch (badge.key) {
      case 'first_submission':
        earned = stats.totalSubmissions >= 1
        break
      case 'three_completed':
        earned = stats.reviewedCount >= 3
        break
      case 'high_scorer':
        earned = stats.maxScore >= 90
        break
      case 'five_completed':
        earned = stats.reviewedCount >= 5
        break
    }
    return { ...badge, earned }
  })
}
