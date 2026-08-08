import { useMemo, useState } from 'react'
import { Search, User } from 'lucide-react'
import type { Person } from '../lib/types'

export function PeoplePage({ people }: { people: Person[] }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return people
    return people.filter(
      (p) => p.full_name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q),
    )
  }, [people, search])

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pessoas</h1>
          <p className="page-subtitle">
            {people.length} pessoa{people.length === 1 ? '' : 's'} registada{people.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', maxWidth: '22rem' }}>
        <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
        <input
          className="field-input"
          style={{ paddingLeft: '2rem' }}
          placeholder="Pesquisar nome ou email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="data-table-wrap">
        {filtered.length === 0 ? (
          <div className="empty-state">Nenhuma pessoa encontrada.</div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Contacto</th>
                  <th>Organizações</th>
                  <th>Desde</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((person) => (
                  <tr key={person.person_id}>
                    <td>
                      <div className="table-row-main">
                        <div className="table-icon">
                          <User size={14} color="rgba(255,255,255,0.5)" />
                        </div>
                        <span className="table-name">{person.full_name}</span>
                      </div>
                    </td>
                    <td className="table-muted">
                      {person.email}
                      {person.phone ? ` · ${person.phone}` : ''}
                    </td>
                    <td className="table-muted">{person.organizations}</td>
                    <td className="table-muted">
                      {new Date(person.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
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
              {filtered.length} de {people.length} pessoa{people.length === 1 ? '' : 's'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
