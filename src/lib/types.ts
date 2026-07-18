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
