export interface AnalyticsOverview {
  total_profiles: number
  total_organizations: number
  total_org_songs: number
  total_catalog_songs: number
  total_events: number
  published_events: number
  total_ministries: number
  total_setlist_entries: number
  active_memberships: number
}

export interface GrowthPoint {
  month: string
  new_profiles: number
  new_organizations: number
}

export interface TopSong {
  song_name: string
  artist: string | null
  times_used: number
}

export interface OrgSummary {
  org_id: string
  name: string
  created_at: string
  member_count: number
  song_count: number
  event_count: number
}

export interface Person {
  person_id: string
  full_name: string
  email: string
  phone: string | null
  created_at: string
  organizations: string
}

export type PlanSlug = 'semente' | 'broto' | 'colheita' | 'celeiro'

export type SubscriptionStatus =
  | 'active'
  | 'free'
  | 'past_due'
  | 'downgraded_locked'
  | 'expired'
  | 'canceled'

export interface Plan {
  slug: PlanSlug
  name: string
  max_people: number | null
  max_ministries: number | null
  max_admins: number | null
  max_leaders: number | null
  price_monthly: number
  price_annual: number
  sort_order: number
}

export interface OrgSubscriptionRow {
  org_id: string
  org_name: string
  org_created_at: string
  plan: PlanSlug
  plan_name: string
  status: SubscriptionStatus
  source: 'free' | 'manual' | 'coupon' | 'stripe'
  billing_cycle: 'monthly' | 'annual'
  started_at: string | null
  expires_at: string | null
  note: string | null
  member_count: number
}

export interface PlanLimitPreview {
  resource_type: 'people' | 'ministry' | 'admin' | 'leader'
  used: number
  limit: number | null
  allowed: boolean
}
