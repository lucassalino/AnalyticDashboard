import { Users, Building2, Music2, CalendarCheck, ListMusic } from 'lucide-react'
import type { AnalyticsOverview, GrowthPoint, TopSong } from '../lib/types'
import { StatCard } from './StatCard'
import { GrowthChart } from './GrowthChart'
import { TopSongs } from './TopSongs'

interface OverviewPageProps {
  overview: AnalyticsOverview
  growth: GrowthPoint[]
  topSongs: TopSong[]
}

export function OverviewPage({ overview, growth, topSongs }: OverviewPageProps) {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Visão geral</h1>
          <p className="page-subtitle">Dados agregados do ServiceFlow</p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
        }}
      >
        <StatCard icon={Users} label="Pessoas" value={overview.total_profiles} />
        <StatCard icon={Building2} label="Organizações" value={overview.total_organizations} />
        <StatCard icon={Music2} label="Músicas" value={overview.total_org_songs} />
        <StatCard icon={CalendarCheck} label="Eventos publicados" value={overview.published_events} />
        <StatCard icon={ListMusic} label="Entradas em setlists" value={overview.total_setlist_entries} />
      </div>

      <GrowthChart data={growth} />

      <TopSongs songs={topSongs} />
    </div>
  )
}
