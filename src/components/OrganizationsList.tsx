import { Building2, Users, Music2, CalendarDays } from 'lucide-react'
import type { OrgSummary } from '../lib/types'

export function OrganizationsList({ orgs }: { orgs: OrgSummary[] }) {
  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.2rem' }}>Organizações</h2>
      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 1rem' }}>
        {orgs.length} organizaç{orgs.length === 1 ? 'ão' : 'ões'} registada{orgs.length === 1 ? '' : 's'}
      </p>

      {orgs.length === 0 ? (
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Sem organizações ainda.</p>
      ) : (
        <div>
          {orgs.map((org) => (
            <div key={org.org_id} className="glass-row" style={{ padding: '0.75rem 0' }}>
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Building2 size={15} color="rgba(255,255,255,0.5)" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {org.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                  desde {new Date(org.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', flexShrink: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Users size={13} /> {org.member_count}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Music2 size={13} /> {org.song_count}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CalendarDays size={13} /> {org.event_count}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
