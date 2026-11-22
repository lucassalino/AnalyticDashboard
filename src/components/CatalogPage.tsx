import { useEffect, useMemo, useState } from 'react'
import { Music2, Search, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { CatalogSong } from '../lib/types'

const EMPTY_FORM = {
  name: '',
  artist: '',
  lyrics: '',
  chords: '',
  youtube_url: '',
  spotify_url: '',
  bpm: '',
}

type FormState = typeof EMPTY_FORM

function songToForm(song: CatalogSong): FormState {
  return {
    name: song.name,
    artist: song.artist,
    lyrics: song.lyrics ?? '',
    chords: song.chords ?? '',
    youtube_url: song.youtube_url ?? '',
    spotify_url: song.spotify_url ?? '',
    bpm: song.bpm != null ? String(song.bpm) : '',
  }
}

export function CatalogPage() {
  const [songs, setSongs] = useState<CatalogSong[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('catalog_songs')
      .select('id,name,artist,lyrics,chords,youtube_url,spotify_url,bpm,created_at,updated_at')
      .order('name')

    if (error) {
      setLoadError(error.message)
      setLoading(false)
      return
    }

    setSongs((data ?? []) as CatalogSong[])
    setLoadError(null)
    setLoading(false)
  }

  const selectedSong = useMemo(() => songs.find((s) => s.id === selectedId) ?? null, [songs, selectedId])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return songs
    return songs.filter((s) => s.name.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q))
  }, [songs, search])

  function selectSong(song: CatalogSong) {
    setSelectedId(song.id)
    setCreating(false)
    setForm(songToForm(song))
    setSaveError(null)
    setSaveSuccess(null)
    setConfirmingDelete(false)
  }

  function startCreate() {
    setSelectedId(null)
    setCreating(true)
    setForm(EMPTY_FORM)
    setSaveError(null)
    setSaveSuccess(null)
    setConfirmingDelete(false)
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setSaveError('O nome da música é obrigatório.')
      return
    }

    setSaving(true)
    setSaveError(null)
    setSaveSuccess(null)

    const bpmValue = form.bpm.trim() ? Number(form.bpm) : null

    if (creating) {
      const { data, error } = await supabase
        .from('catalog_songs')
        .insert({
          name: form.name.trim(),
          artist: form.artist.trim(),
          lyrics: form.lyrics.trim() || null,
          chords: form.chords.trim() || null,
          youtube_url: form.youtube_url.trim() || null,
          spotify_url: form.spotify_url.trim() || null,
          bpm: bpmValue,
        })
        .select('id,name,artist,lyrics,chords,youtube_url,spotify_url,bpm,created_at,updated_at')
        .single()

      setSaving(false)

      if (error) {
        setSaveError(error.message)
        return
      }

      const created = data as CatalogSong
      setSongs((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      setSelectedId(created.id)
      setCreating(false)
      setSaveSuccess('Música criada.')
      return
    }

    if (!selectedId) return

    const { error } = await supabase.rpc('admin_update_catalog_song', {
      p_id: selectedId,
      p_name: form.name.trim(),
      p_artist: form.artist.trim(),
      p_lyrics: form.lyrics.trim() || null,
      p_chords: form.chords.trim() || null,
      p_youtube_url: form.youtube_url.trim() || null,
      p_spotify_url: form.spotify_url.trim() || null,
      p_bpm: bpmValue,
    })

    setSaving(false)

    if (error) {
      setSaveError(error.message === 'forbidden' ? 'A tua conta não tem acesso a esta ação.' : error.message)
      return
    }

    setSongs((prev) =>
      prev
        .map((s) =>
          s.id === selectedId
            ? {
                ...s,
                name: form.name.trim(),
                artist: form.artist.trim(),
                lyrics: form.lyrics.trim() || null,
                chords: form.chords.trim() || null,
                youtube_url: form.youtube_url.trim() || null,
                spotify_url: form.spotify_url.trim() || null,
                bpm: bpmValue,
              }
            : s,
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    )
    setSaveSuccess('Alterações guardadas.')
  }

  async function handleDelete() {
    if (!selectedId) return

    setDeleting(true)
    setSaveError(null)

    const { error } = await supabase.rpc('admin_delete_catalog_song', { p_song_id: selectedId })

    setDeleting(false)
    setConfirmingDelete(false)

    if (error) {
      setSaveError(error.message === 'forbidden' ? 'A tua conta não tem acesso a esta ação.' : error.message)
      return
    }

    setSongs((prev) => prev.filter((s) => s.id !== selectedId))
    setSelectedId(null)
  }

  if (loading) {
    return (
      <div className="page-content">
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', padding: '2rem 0', textAlign: 'center' }}>
          A carregar catálogo…
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="page-content">
        <div className="glass-card" style={{ padding: '1.25rem', color: '#d99a9a', fontSize: '0.85rem' }}>
          {loadError}
        </div>
      </div>
    )
  }

  const isEditing = creating || selectedSong !== null

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Catálogo</h1>
          <p className="page-subtitle">
            {songs.length} música{songs.length === 1 ? '' : 's'} no banco global partilhado por todas as organizações
          </p>
        </div>
        <button className="primary-btn" onClick={startCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus size={15} /> Nova música
        </button>
      </div>

      <div className="plans-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
            <input
              className="field-input"
              style={{ paddingLeft: '2rem' }}
              placeholder="Pesquisar música ou artista…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="data-table-wrap">
            {filtered.length === 0 ? (
              <div className="empty-state">Nenhuma música encontrada.</div>
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Música</th>
                      <th>BPM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((song) => (
                      <tr
                        key={song.id}
                        onClick={() => selectSong(song)}
                        style={{
                          cursor: 'pointer',
                          background: song.id === selectedId ? 'rgba(255,255,255,0.05)' : undefined,
                        }}
                      >
                        <td>
                          <div className="table-row-main">
                            <div className="table-icon">
                              <Music2 size={14} color="rgba(255,255,255,0.5)" />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div className="table-name">{song.name}</div>
                              {song.artist && (
                                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{song.artist}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="table-muted" data-label="BPM">{song.bpm ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filtered.length > 0 && (
              <div className="table-footer">
                <span>
                  {filtered.length} de {songs.length} música{songs.length === 1 ? '' : 's'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          {!isEditing ? (
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
              Seleciona uma música para editar, ou cria uma nova.
            </p>
          ) : (
            <>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1.25rem' }}>
                {creating ? 'Nova música' : 'Editar música'}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.375rem' }}>
                      Nome
                    </label>
                    <input className="field-input" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.375rem' }}>
                      Artista
                    </label>
                    <input className="field-input" value={form.artist} onChange={(e) => updateField('artist', e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.375rem' }}>
                      BPM
                    </label>
                    <input
                      className="field-input"
                      type="number"
                      value={form.bpm}
                      onChange={(e) => updateField('bpm', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.375rem' }}>
                      YouTube
                    </label>
                    <input className="field-input" value={form.youtube_url} onChange={(e) => updateField('youtube_url', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.375rem' }}>
                      Spotify
                    </label>
                    <input className="field-input" value={form.spotify_url} onChange={(e) => updateField('spotify_url', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.375rem' }}>
                    Cifra
                  </label>
                  <textarea className="field-textarea" rows={4} value={form.chords} onChange={(e) => updateField('chords', e.target.value)} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.375rem' }}>
                    Letra
                  </label>
                  <textarea className="field-textarea" rows={6} value={form.lyrics} onChange={(e) => updateField('lyrics', e.target.value)} />
                </div>

                {saveError && <p style={{ fontSize: '0.8rem', color: '#d99a9a' }}>{saveError}</p>}
                {saveSuccess && <p style={{ fontSize: '0.8rem', color: '#8fc9a3' }}>{saveSuccess}</p>}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="primary-btn" onClick={handleSave} disabled={saving}>
                    {saving ? 'A guardar…' : creating ? 'Criar música' : 'Guardar alterações'}
                  </button>

                  {!creating && !confirmingDelete && (
                    <button className="danger-btn" onClick={() => setConfirmingDelete(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Trash2 size={14} /> Apagar
                    </button>
                  )}
                </div>

                {confirmingDelete && (
                  <div className="warning-box" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      Apagar <strong>{selectedSong?.name}</strong> do catálogo global? As organizações que já a usam
                      mantêm a sua cópia — só deixa de aparecer no catálogo partilhado.
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button className="danger-btn" onClick={handleDelete} disabled={deleting}>
                        {deleting ? 'A apagar…' : 'Confirmar remoção'}
                      </button>
                      <button className="ghost-btn" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
