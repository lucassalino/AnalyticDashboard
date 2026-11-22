import { useEffect, useMemo, useState } from 'react'
import { Building2, Search, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { OrgSummary, OrgHealth } from '../lib/types'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function OrganizationsPage({ orgs, onSelectOrg }: { orgs: OrgSummary[]; onSelectOrg: (orgId: string) => void }) {
  const [search, setSearch] = useState('')
  const [health, setHealth] = useState<Record<string, OrgHealth>>({})

  useEffect(() => {
    supabase.rpc('admin_orgs_health').then(({ data }) => {
      const map: Record<string, OrgHealth> = {}
      for (const row of (data ?? []) as OrgHealth[]) {
        map[row.org_id] = row
      }
      setHealth(map)
    })
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return orgs
    return orgs.filter((o) => o.name.toLowerCase().includes(q))
  }, [orgs, search])

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Organizações</h1>
          <p className="page-subtitle">
            {orgs.length} organizaç{orgs.length === 1 ? 'ão' : 'ões'} registada{orgs.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', maxWidth: '22rem' }}>
        <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
        <input
          className="field-input"
          style={{ paddingLeft: '2rem' }}
          placeholder="Pesquisar organização…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="data-table-wrap">
        {filtered.length === 0 ? (
          <div className="empty-state">Nenhuma organização encontrada.</div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Organização</th>
                  <th>Pessoas</th>
                  <th>Músicas</th>
                  <th>Eventos</th>
                  <th>Última atividade</th>
                  <th>Criada</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((org) => {
                  const h = health[org.org_id]
                  const inactive = h && (h.days_since_last_event === null || h.days_since_last_event > 60)
                  return (
                    <tr key={org.org_id} onClick={() => onSelectOrg(org.org_id)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div className="table-row-main">
                          <div className="table-icon">
                            <Building2 size={14} color="rgba(255,255,255,0.5)" />
                          </div>
                          <span className="table-name">{org.name}</span>
                        </div>
                      </td>
                      <td className="table-muted" data-label="Pessoas">{org.member_count}</td>
                      <td className="table-muted" data-label="Músicas">{org.song_count}</td>
                      <td className="table-muted" data-label="Eventos">{org.event_count}</td>
                      <td data-label="Última atividade">
                        {!h ? (
                          <span className="table-muted">—</span>
                        ) : inactive ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#d99a9a', fontSize: '0.78rem' }}>
                            <AlertTriangle size={12} />
                            {h.last_event_date ? `há ${h.days_since_last_event} dias` : 'sem eventos'}
                          </span>
                        ) : (
                          <span className="table-muted">{h.last_event_date ? formatDate(h.last_event_date) : '—'}</span>
                        )}
                      </td>
                      <td className="table-muted" data-label="Criada">{formatDate(org.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="table-footer">
            <span>
              {filtered.length} de {orgs.length} organizaç{orgs.length === 1 ? 'ão' : 'ões'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
