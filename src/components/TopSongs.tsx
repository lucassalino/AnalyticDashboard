import { Music2 } from 'lucide-react'
import type { TopSong } from '../lib/types'

export function TopSongs({ songs }: { songs: TopSong[] }) {
  const max = songs[0]?.times_used ?? 1

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.2rem' }}>Músicas mais usadas</h2>
      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 1rem' }}>
        Ranking por presença em setlists de eventos
      </p>

      {songs.length === 0 ? (
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Sem dados de setlists ainda.</p>
      ) : (
        <div>
          {songs.map((song, i) => (
            <div key={`${song.song_name}-${i}`} className="glass-row" style={{ padding: '0.75rem 0' }}>
              <div
                style={{
                  width: '1.75rem',
                  height: '1.75rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                {i + 1}
              </div>

              <Music2 size={16} color="rgba(255,255,255,0.35)" />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {song.song_name}
                </div>
                {song.artist && (
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{song.artist}</div>
                )}
                <div
                  style={{
                    marginTop: '0.375rem',
                    height: 4,
                    borderRadius: 9999,
                    background: 'rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.max(6, (song.times_used / max) * 100)}%`,
                      background: '#5b7fa6',
                      borderRadius: 9999,
                    }}
                  />
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', flexShrink: 0 }}>
                {song.times_used}×
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
