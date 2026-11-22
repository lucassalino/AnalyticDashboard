import { LayoutDashboard, Building2, Users, BadgeCheck, Music2, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

export type PageKey = 'overview' | 'organizations' | 'people' | 'plans' | 'catalog'

interface NavItem {
  key: PageKey
  label: string
  icon: typeof LayoutDashboard
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Monitorização',
    items: [
      { key: 'overview', label: 'Visão geral', icon: LayoutDashboard },
      { key: 'organizations', label: 'Organizações', icon: Building2 },
      { key: 'people', label: 'Pessoas', icon: Users },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { key: 'plans', label: 'Planos', icon: BadgeCheck },
      { key: 'catalog', label: 'Catálogo', icon: Music2 },
    ],
  },
]

const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items)

export function Sidebar({ page, onNavigate, userEmail }: { page: PageKey; onNavigate: (page: PageKey) => void; userEmail: string }) {
  const initial = userEmail.trim().charAt(0).toUpperCase() || '?'

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-workspace">
          <div className="sidebar-avatar">{initial}</div>
          <span className="sidebar-workspace-name">AnalyticDashboard</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div className="sidebar-group" key={group.label}>
              <div className="sidebar-group-label">{group.label}</div>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  className={`sidebar-link${page === item.key ? ' active' : ''}`}
                  onClick={() => onNavigate(item.key)}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </div>
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

      <header className="mobile-topbar">
        <div className="sidebar-workspace" style={{ padding: 0 }}>
          <div className="sidebar-avatar">{initial}</div>
          <span className="sidebar-workspace-name">AnalyticDashboard</span>
        </div>
        <button className="icon-btn" onClick={() => supabase.auth.signOut()} aria-label="Sair">
          <LogOut size={15} />
        </button>
      </header>

      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`bottom-nav-link${page === item.key ? ' active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <item.icon size={19} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
