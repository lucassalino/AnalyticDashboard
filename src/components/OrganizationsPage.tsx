import { useMemo, useState } from 'react'
import { Building2, Search } from 'lucide-react'
import type { OrgSummary } from '../lib/types'

export function OrganizationsPage({ orgs }: { orgs: OrgSummary[] }) {
  const [search, setSearch] = useState('')

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
                  <th>Criada</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((org) => (
                  <tr key={org.org_id}>
                    <td>
                      <div className="table-row-main">
                        <div className="table-icon">
                          <Building2 size={14} color="rgba(255,255,255,0.5)" />
                        </div>
                        <span className="table-name">{org.name}</span>
                      </div>
                    </td>
                    <td className="table-muted">{org.member_count}</td>
                    <td className="table-muted">{org.song_count}</td>
                    <td className="table-muted">{org.event_count}</td>
                    <td className="table-muted">
                      {new Date(org.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
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
