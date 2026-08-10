import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { AnalyticsOverview, GrowthPoint, TopSong, OrgSummary, Person } from '../lib/types'
import { Sidebar, type PageKey } from './Sidebar'
import { OverviewPage } from './OverviewPage'
import { OrganizationsPage } from './OrganizationsPage'
import { PeoplePage } from './PeoplePage'
import { AdminPlans } from './AdminPlans'
import { CatalogPage } from './CatalogPage'

interface DashboardData {
  overview: AnalyticsOverview
  growth: GrowthPoint[]
  topSongs: TopSong[]
  orgs: OrgSummary[]
  people: Person[]
}

export function Dashboard({ userEmail }: { userEmail: string }) {
  const [page, setPage] = useState<PageKey>('overview')
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [overviewRes, growthRes, songsRes, orgsRes, peopleRes] = await Promise.all([
        supabase.rpc('admin_analytics_overview'),
        supabase.rpc('admin_analytics_growth_by_month', { months_back: 12 }),
        supabase.rpc('admin_analytics_top_songs', { limit_count: 10 }),
        supabase.rpc('admin_analytics_organizations'),
        supabase.rpc('admin_analytics_people'),
      ])

      if (cancelled) return

      const firstError =
        overviewRes.error || growthRes.error || songsRes.error || orgsRes.error || peopleRes.error
      if (firstError) {
        setError(
          firstError.message === 'forbidden'
            ? 'A tua conta não tem acesso a este dashboard.'
            : firstError.message,
        )
        return
      }

      setData({
        overview: overviewRes.data as AnalyticsOverview,
        growth: (growthRes.data ?? []) as GrowthPoint[],
        topSongs: (songsRes.data ?? []) as TopSong[],
        orgs: (orgsRes.data ?? []) as OrgSummary[],
        people: (peopleRes.data ?? []) as Person[],
      })
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="app-shell">
      <Sidebar page={page} onNavigate={setPage} userEmail={userEmail} />

      <div className="main-area">
        <div className="top-bar" />

        {error && (
          <div className="page-content">
            <div className="glass-card" style={{ padding: '1.25rem', color: '#fca5a5', fontSize: '0.85rem' }}>
              {error}
            </div>
          </div>
        )}

        {!error && !data && (
          <div className="page-content">
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', padding: '2rem 0', textAlign: 'center' }}>
              A carregar dados…
            </div>
          </div>
        )}

        {!error && data && (
          <>
            {page === 'overview' && (
              <OverviewPage overview={data.overview} growth={data.growth} topSongs={data.topSongs} />
            )}
            {page === 'organizations' && <OrganizationsPage orgs={data.orgs} />}
            {page === 'people' && <PeoplePage people={data.people} />}
            {page === 'plans' && (
              <div className="page-content">
                <div className="page-header">
                  <div>
                    <h1 className="page-title">Planos</h1>
                    <p className="page-subtitle">Conceder planos de cortesia a organizações</p>
                  </div>
                </div>
                <AdminPlans />
              </div>
            )}
            {page === 'catalog' && <CatalogPage />}
          </>
        )}
      </div>
    </div>
  )
}
