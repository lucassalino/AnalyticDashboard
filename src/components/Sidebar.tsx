import { LayoutDashboard, Building2, Users, BadgeCheck, Music2, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

export type PageKey = 'overview' | 'organizations' | 'people' | 'plans' | 'catalog'

const NAV_ITEMS: { key: PageKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'overview', label: 'Visão geral', icon: LayoutDashboard },
  { key: 'organizations', label: 'Organizações', icon: Building2 },
  { key: 'people', label: 'Pessoas', icon: Users },
  { key: 'plans', label: 'Planos', icon: BadgeCheck },
  { key: 'catalog', label: 'Catálogo', icon: Music2 },
]

export function Sidebar({ page, onNavigate, userEmail }: { page: PageKey; onNavigate: (page: PageKey) => void; userEmail: string }) {
  const initial = userEmail.trim().charAt(0).toUpperCase() || '?'

  return (
    <aside className="sidebar">
      <div className="sidebar-workspace">
        <div className="sidebar-avatar">{initial}</div>
        <span className="sidebar-workspace-name">AnalyticDashboard</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`sidebar-link${page === item.key ? ' active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">{userEmail}</div>
        <button className="sidebar-link" onClick={() => supabase.auth.signOut()}>
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
