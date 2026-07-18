import { useState } from 'react'
import { User, Search } from 'lucide-react'
import type { Person } from '../lib/types'

export function PeopleList({ people }: { people: Person[] }) {
  const [query, setQuery] = useState('')

  const filtered = people.filter((p) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      p.full_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.organizations.toLowerCase().includes(q)
    )
  })

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.2rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Pessoas</h2>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 1rem' }}>
        {people.length} pessoa{people.length === 1 ? '' : 's'} registada{people.length === 1 ? '' : 's'}
      </p>

      <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
        <Search
          size={14}
          color="rgba(255,255,255,0.35)"
          style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Procurar por nome, email ou organização…"
          style={{
            width: '100%',
            height: '2.25rem',
            paddingLeft: '2.1rem',
            paddingRight: '0.75rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.5rem',
            color: '#fff',
            fontSize: '0.8rem',
          }}
        />
      </div>

      <div style={{ maxHeight: '22rem', overflowY: 'auto' }} className="scrollbar-none">
        {filtered.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Nenhuma pessoa encontrada.</p>
        ) : (
          filtered.map((person) => (
            <div key={person.person_id} className="glass-row" style={{ padding: '0.75rem 0' }}>
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <User size={14} color="rgba(255,255,255,0.5)" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {person.full_name || '(sem nome)'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {person.email}
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.72rem',
                  textAlign: 'right',
                  maxWidth: '10rem',
                  flexShrink: 0,
                }}
              >
                <div style={{ color: 'rgba(255,255,255,0.55)' }}>{person.organizations}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', marginTop: '0.15rem' }}>
                  desde {new Date(person.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
