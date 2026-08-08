import { useEffect, useState } from 'react'
import { Users, Building2, Music2, CalendarCheck, ListMusic, LogOut, LayoutDashboard, BadgeCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { AnalyticsOverview, GrowthPoint, TopSong, OrgSummary, Person } from '../lib/types'
import { StatCard } from './StatCard'
import { GrowthChart } from './GrowthChart'
import { TopSongs } from './TopSongs'
import { OrganizationsList } from './OrganizationsList'
import { PeopleList } from './PeopleList'
import { AdminPlans } from './AdminPlans'

interface DashboardData {
  overview: AnalyticsOverview
  growth: GrowthPoint[]
  topSongs: TopSong[]
  orgs: OrgSummary[]
  people: Person[]
}

export function Dashboard({ userEmail }: { userEmail: string }) {
  const [tab, setTab] = useState<'overview' | 'plans'>('overview')
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
    <div className="app-bg">
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>AnalyticDashboard</h1>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: '0.15rem 0 0' }}>
            ServiceFlow · dados agregados
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <nav style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setTab('overview')}
              className="ghost-btn"
              style={{ background: tab === 'overview' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)' }}
            >
              <LayoutDashboard size={13} /> Visão geral
            </button>
            <button
              onClick={() => setTab('plans')}
              className="ghost-btn"
              style={{ background: tab === 'plans' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)' }}
            >
              <BadgeCheck size={13} /> Planos
            </button>
          </nav>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{userEmail}</span>
          <button onClick={() => supabase.auth.signOut()} className="ghost-btn">
            <LogOut size={13} /> Sair
          </button>
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '72rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {tab === 'plans' && <AdminPlans />}

        {tab === 'overview' && (
          <>
            {error && (
              <div className="glass-card" style={{ padding: '1.25rem', color: '#fca5a5', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            {!error && !data && (
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', padding: '2rem 0', textAlign: 'center' }}>
                A carregar dados…
              </div>
            )}

            {data && (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <StatCard icon={Users} label="Pessoas" value={data.overview.total_profiles} />
                  <StatCard icon={Building2} label="Organizações" value={data.overview.total_organizations} />
                  <StatCard icon={Music2} label="Músicas" value={data.overview.total_org_songs} />
                  <StatCard icon={CalendarCheck} label="Eventos publicados" value={data.overview.published_events} />
                  <StatCard icon={ListMusic} label="Entradas em setlists" value={data.overview.total_setlist_entries} />
                </div>

                <GrowthChart data={data.growth} />

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '1.5rem',
                    alignItems: 'start',
                  }}
                >
                  <PeopleList people={data.people} />
                  <OrganizationsList orgs={data.orgs} />
                  <TopSongs songs={data.topSongs} />
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
