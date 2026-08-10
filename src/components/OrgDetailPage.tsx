import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { ArrowLeft, Users, Building2, CalendarDays, Music2, Mail, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { OrgDetail, OrgGrowthPoint, PlanLimitPreview } from '../lib/types'

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  free: 'Grátis',
  past_due: 'Pagamento em falta',
  downgraded_locked: 'Bloqueado (acima do limite)',
  expired: 'Expirado',
  canceled: 'Cancelado',
}

const SOURCE_LABELS: Record<string, string> = {
  stripe: 'Pago (Stripe)',
  manual: 'Cortesia',
  coupon: 'Cortesia (cupão)',
  free: 'Grátis',
}

const RESOURCE_LABELS: Record<PlanLimitPreview['resource_type'], string> = {
  people: 'Pessoas',
  ministry: 'Ministérios',
  admin: 'Administradores',
  leader: 'Líderes',
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatMonth(value: string | number | Date) {
  return new Date(value).toLocaleDateString('pt-PT', { month: 'short' })
}

export function OrgDetailPage({ orgId, onBack }: { orgId: string; onBack: () => void }) {
  const [detail, setDetail] = useState<OrgDetail | null>(null)
  const [growth, setGrowth] = useState<OrgGrowthPoint[]>([])
  const [limits, setLimits] = useState<PlanLimitPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const [detailRes, growthRes, ...limitResults] = await Promise.all([
        supabase.rpc('admin_org_detail', { p_org_id: orgId }),
        supabase.rpc('admin_org_growth', { p_org_id: orgId, p_months_back: 12 }),
        ...(['people', 'ministry', 'admin', 'leader'] as const).map((resource) =>
          supabase.rpc('check_plan_limit', { p_org_id: orgId, p_resource_type: resource }),
        ),
      ])

      if (cancelled) return

      const firstError = detailRes.error || growthRes.error || limitResults.find((r) => r.error)?.error
      if (firstError) {
        setError(firstError.message === 'forbidden' ? 'A tua conta não tem acesso a este detalhe.' : firstError.message)
        setLoading(false)
        return
      }

      setDetail((detailRes.data?.[0] ?? null) as OrgDetail | null)
      setGrowth((growthRes.data ?? []) as OrgGrowthPoint[])
      setLimits(
        (['people', 'ministry', 'admin', 'leader'] as const).map((resource, i) => {
          const row = limitResults[i].data?.[0]
          return {
            resource_type: resource,
            used: row?.used ?? 0,
            limit: row?.limit ?? null,
            allowed: row?.allowed ?? true,
          }
        }),
      )
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [orgId])

  if (loading) {
    return (
      <div className="page-content">
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', padding: '2rem 0', textAlign: 'center' }}>
          A carregar organização…
        </div>
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="page-content">
        <button className="ghost-btn" onClick={onBack} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={13} /> Voltar
        </button>
        <div className="glass-card" style={{ padding: '1.25rem', color: '#fca5a5', fontSize: '0.85rem' }}>
          {error ?? 'Organização não encontrada.'}
        </div>
      </div>
    )
  }

  const isInactive = detail.days_since_last_event === null || detail.days_since_last_event > 60

  return (
    <div className="page-content">
      <div>
        <button className="ghost-btn" onClick={onBack} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={13} /> Voltar a Organizações
        </button>

        <div className="page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 className="page-title">{detail.org_name}</h1>
              <span className={`source-badge source-${detail.source}`}>{SOURCE_LABELS[detail.source] ?? detail.source}</span>
              <span className={`status-badge status-${detail.status}`}>{STATUS_LABELS[detail.status] ?? detail.status}</span>
            </div>
            <p className="page-subtitle">
              Plano {detail.plan_name} · desde {formatDate(detail.org_created_at)}
              {detail.note ? ` · nota: ${detail.note}` : ''}
            </p>
          </div>
        </div>
      </div>

      {isInactive && (
        <div className="warning-box">
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <div>
            {detail.last_event_date
              ? `Sem eventos há ${detail.days_since_last_event} dias — última atividade em ${formatDate(detail.last_event_date)}.`
              : 'Esta organização nunca criou um evento.'}
          </div>
        </div>
      )}

      <div className="stat-grid">
        <div className="glass-stat">
          <div className="stat-icon"><Users size={18} color="rgba(255,255,255,0.85)" /></div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{detail.member_count}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Pessoas</div>
          </div>
        </div>
        <div className="glass-stat">
          <div className="stat-icon"><Building2 size={18} color="rgba(255,255,255,0.85)" /></div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{detail.ministry_count}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Ministérios</div>
          </div>
        </div>
        <div className="glass-stat">
          <div className="stat-icon"><CalendarDays size={18} color="rgba(255,255,255,0.85)" /></div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{detail.upcoming_event_count}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Eventos futuros</div>
          </div>
        </div>
        <div className="glass-stat">
          <div className="stat-icon"><Music2 size={18} color="rgba(255,255,255,0.85)" /></div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{detail.song_count}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Músicas</div>
          </div>
        </div>
        <div className="glass-stat">
          <div className="stat-icon"><Mail size={18} color="rgba(255,255,255,0.85)" /></div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{detail.pending_invite_count}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Convites pendentes</div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.2rem' }}>Limites do plano {detail.plan_name}</h2>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 1.25rem' }}>
          Uso atual face aos limites do plano contratado
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {limits.map((l) => {
            const pct = l.limit ? Math.min(100, (l.used / l.limit) * 100) : 0
            return (
              <div key={l.resource_type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>{RESOURCE_LABELS[l.resource_type]}</span>
                  <span style={{ color: l.allowed ? 'rgba(255,255,255,0.5)' : '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {!l.allowed && <AlertTriangle size={12} />}
                    {l.used} / {l.limit ?? '∞'}
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: l.limit ? `${Math.max(4, pct)}%` : '100%',
                      background: l.allowed ? '#3987e5' : '#f87171',
                      borderRadius: 9999,
                    }}
                  />
                </div>
              </div>
            )
          })}
          {limits.every((l) => l.allowed) && (
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
              <CheckCircle2 size={14} color="#86efac" /> Dentro dos limites do plano.
            </p>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.2rem' }}>Crescimento (12 meses)</h2>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 1rem' }}>
          Novos membros e eventos criados por mês, nesta organização
        </p>

        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={growth} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="#2c2c2a" vertical={false} />
            <XAxis dataKey="month" tickFormatter={formatMonth} stroke="#383835" tick={{ fill: '#898781', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#383835' }} />
            <YAxis allowDecimals={false} stroke="#383835" tick={{ fill: '#898781', fontSize: 11 }} tickLine={false} axisLine={false} width={32} />
            <Tooltip
              cursor={{ stroke: 'rgba(255,255,255,0.15)' }}
              contentStyle={{ background: 'rgba(18,18,22,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#fff' }}
              labelFormatter={(v) => formatMonth(v as string)}
            />
            <Line type="monotone" dataKey="new_members" name="Novos membros" stroke="#3987e5" strokeWidth={2} dot={{ r: 2.5, fill: '#3987e5', strokeWidth: 0 }} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="new_events" name="Novos eventos" stroke="#008300" strokeWidth={2} dot={{ r: 2.5, fill: '#008300', strokeWidth: 0 }} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
