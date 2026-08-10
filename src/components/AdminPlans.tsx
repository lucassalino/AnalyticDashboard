import { useEffect, useMemo, useState } from 'react'
import { Building2, Search, AlertTriangle, CheckCircle2, Loader2, ShieldOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { OrgSubscriptionRow, Plan, PlanLimitPreview, PlanSlug } from '../lib/types'

const RESOURCE_LABELS: Record<PlanLimitPreview['resource_type'], string> = {
  people: 'Pessoas',
  ministry: 'Ministérios',
  admin: 'Administradores',
  leader: 'Líderes',
}

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

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function AdminPlans() {
  const [orgs, setOrgs] = useState<OrgSubscriptionRow[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [targetPlan, setTargetPlan] = useState<PlanSlug>('semente')
  const [note, setNote] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const [preview, setPreview] = useState<PlanLimitPreview[] | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const [granting, setGranting] = useState(false)
  const [grantError, setGrantError] = useState<string | null>(null)
  const [grantSuccess, setGrantSuccess] = useState<string | null>(null)

  const [confirmingRevoke, setConfirmingRevoke] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [revokeError, setRevokeError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [orgsRes, plansRes] = await Promise.all([
        supabase.rpc('admin_list_org_subscriptions'),
        supabase.from('plans').select('slug,name,max_people,max_ministries,max_admins,max_leaders,price_monthly,price_annual,sort_order').order('sort_order'),
      ])

      if (cancelled) return

      const firstError = orgsRes.error || plansRes.error
      if (firstError) {
        setLoadError(
          firstError.message === 'forbidden'
            ? 'A tua conta não tem acesso a este painel.'
            : firstError.message,
        )
        setLoading(false)
        return
      }

      setOrgs((orgsRes.data ?? []) as OrgSubscriptionRow[])
      setPlans((plansRes.data ?? []) as Plan[])
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const selectedOrg = useMemo(
    () => orgs.find((o) => o.org_id === selectedOrgId) ?? null,
    [orgs, selectedOrgId],
  )

  const filteredOrgs = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orgs.filter((o) => {
      const matchesSearch = !q || o.org_name.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orgs, search, statusFilter])

  function selectOrg(org: OrgSubscriptionRow) {
    setSelectedOrgId(org.org_id)
    setTargetPlan(org.plan)
    setNote('')
    setExpiresAt('')
    setGrantError(null)
    setGrantSuccess(null)
    setConfirmingRevoke(false)
    setRevokeError(null)
  }

  useEffect(() => {
    if (!selectedOrgId) {
      setPreview(null)
      return
    }

    let cancelled = false
    setPreviewLoading(true)
    setPreviewError(null)

    supabase
      .rpc('admin_preview_plan_limits', { p_org_id: selectedOrgId, p_target_plan: targetPlan })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setPreviewError(error.message)
          setPreview(null)
        } else {
          setPreview((data ?? []) as PlanLimitPreview[])
        }
        setPreviewLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedOrgId, targetPlan])

  const wouldLock = preview?.some((p) => !p.allowed) ?? false

  async function handleGrant() {
    if (!selectedOrgId) return

    setGranting(true)
    setGrantError(null)
    setGrantSuccess(null)

    const { data, error } = await supabase.rpc('admin_grant_plan', {
      p_org_id: selectedOrgId,
      p_plan: targetPlan,
      p_note: note.trim() || null,
      p_expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    })

    setGranting(false)

    if (error) {
      setGrantError(error.message === 'forbidden' ? 'A tua conta não tem acesso a esta ação.' : error.message)
      return
    }

    const finalStatus = (data?.[0]?.status as string) ?? 'active'
    setGrantSuccess(
      finalStatus === 'downgraded_locked'
        ? 'Plano concedido, mas a organização ficou acima dos limites — status: bloqueado.'
        : 'Plano concedido com sucesso.',
    )

    setOrgs((prev) =>
      prev.map((o) =>
        o.org_id === selectedOrgId
          ? {
              ...o,
              plan: targetPlan,
              plan_name: plans.find((p) => p.slug === targetPlan)?.name ?? o.plan_name,
              status: finalStatus as OrgSubscriptionRow['status'],
              source: 'manual',
              note: note.trim() || null,
              expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
            }
          : o,
      ),
    )
  }

  async function handleRevoke() {
    if (!selectedOrgId || !selectedOrg) return

    setRevoking(true)
    setRevokeError(null)
    setGrantSuccess(null)

    const { data, error } = await supabase.rpc('admin_revoke_plan', {
      p_org_id: selectedOrgId,
      p_note: 'Cortesia revogada via painel',
    })

    setRevoking(false)
    setConfirmingRevoke(false)

    if (error) {
      setRevokeError(error.message === 'forbidden' ? 'A tua conta não tem acesso a esta ação.' : error.message)
      return
    }

    const finalStatus = (data?.[0]?.status as string) ?? 'active'
    setGrantSuccess(
      finalStatus === 'downgraded_locked'
        ? 'Cortesia revogada. A organização ficou acima dos limites do Semente — status: bloqueado.'
        : 'Cortesia revogada — organização de volta ao plano Semente.',
    )

    const semente = plans.find((p) => p.slug === 'semente')
    setOrgs((prev) =>
      prev.map((o) =>
        o.org_id === selectedOrgId
          ? {
              ...o,
              plan: 'semente',
              plan_name: semente?.name ?? 'Semente',
              status: finalStatus as OrgSubscriptionRow['status'],
              source: 'manual',
              note: 'Cortesia revogada via painel',
              expires_at: null,
            }
          : o,
      ),
    )
    setTargetPlan('semente')
  }

  if (loading) {
    return (
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', padding: '2rem 0', textAlign: 'center' }}>
        A carregar organizações…
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="glass-card" style={{ padding: '1.25rem', color: '#fca5a5', fontSize: '0.85rem' }}>
        {loadError}
      </div>
    )
  }

  return (
    <div className="plans-grid">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="toolbar">
          <div style={{ position: 'relative', flex: 1, minWidth: '12rem' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
            <input
              className="field-input"
              style={{ paddingLeft: '2rem' }}
              placeholder="Pesquisar organização…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="field-select"
            style={{ width: 'auto', minWidth: '9rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os estados</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="data-table-wrap">
          {filteredOrgs.length === 0 ? (
            <div className="empty-state">Nenhuma organização encontrada.</div>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Organização</th>
                    <th>Plano</th>
                    <th>Origem</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrgs.map((org) => (
                    <tr
                      key={org.org_id}
                      onClick={() => selectOrg(org)}
                      style={{
                        cursor: 'pointer',
                        background: org.org_id === selectedOrgId ? 'rgba(255,255,255,0.05)' : undefined,
                      }}
                    >
                      <td>
                        <div className="table-row-main">
                          <div className="table-icon">
                            <Building2 size={14} color="rgba(255,255,255,0.5)" />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div className="table-name">{org.org_name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{org.member_count} pessoas</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-muted" data-label="Plano">{org.plan_name}</td>
                      <td data-label="Origem">
                        <span className={`source-badge source-${org.source}`}>{SOURCE_LABELS[org.source] ?? org.source}</span>
                      </td>
                      <td data-label="Estado">
                        <span className={`status-badge status-${org.status}`}>{STATUS_LABELS[org.status] ?? org.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredOrgs.length > 0 && (
            <div className="table-footer">
              <span>
                {filteredOrgs.length} de {orgs.length} organizaç{orgs.length === 1 ? 'ão' : 'ões'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {!selectedOrg ? (
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
            Seleciona uma organização para conceder um plano.
          </p>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{selectedOrg.org_name}</h2>
              <span className={`source-badge source-${selectedOrg.source}`}>{SOURCE_LABELS[selectedOrg.source] ?? selectedOrg.source}</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 1.25rem' }}>
              Plano atual: {selectedOrg.plan_name} · {STATUS_LABELS[selectedOrg.status] ?? selectedOrg.status}
              {selectedOrg.expires_at ? ` · expira em ${formatDate(selectedOrg.expires_at)}` : ''}
              {selectedOrg.note ? ` · nota: ${selectedOrg.note}` : ''}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.375rem' }}>
                  Novo plano
                </label>
                <select
                  className="field-select"
                  value={targetPlan}
                  onChange={(e) => setTargetPlan(e.target.value as PlanSlug)}
                >
                  {plans.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name} {p.price_monthly > 0 ? `— ${p.price_monthly}€/mês` : '— grátis'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.375rem' }}>
                  Expira em (opcional)
                </label>
                <input
                  className="field-input"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.375rem' }}>
                  Nota (opcional)
                </label>
                <textarea
                  className="field-textarea"
                  rows={2}
                  placeholder="ex.: cortesia acordada com o pastor X"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {previewLoading && (
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Loader2 size={13} className="animate-spin" /> A verificar limites…
                </p>
              )}

              {previewError && <p style={{ fontSize: '0.78rem', color: '#fca5a5' }}>{previewError}</p>}

              {!previewLoading && preview && wouldLock && (
                <div className="warning-box">
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <div>
                    <strong>Esta organização vai ficar acima dos limites do plano {plans.find((p) => p.slug === targetPlan)?.name}.</strong>
                    <br />
                    O status ficará "bloqueado" e o admin da organização terá de escolher, no ServiceFlow, o que
                    fica ativo até caber no novo limite.
                    <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.1rem' }}>
                      {preview
                        .filter((p) => !p.allowed)
                        .map((p) => (
                          <li key={p.resource_type}>
                            {RESOURCE_LABELS[p.resource_type]}: {p.used} em uso, limite {p.limit}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}

              {!previewLoading && preview && !wouldLock && (
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={14} color="#86efac" /> Dentro dos limites do plano.
                </p>
              )}

              {grantError && <p style={{ fontSize: '0.8rem', color: '#fca5a5' }}>{grantError}</p>}
              {grantSuccess && <p style={{ fontSize: '0.8rem', color: '#86efac' }}>{grantSuccess}</p>}

              <button className="primary-btn" onClick={handleGrant} disabled={granting || previewLoading}>
                {granting ? 'A conceder…' : 'Conceder plano'}
              </button>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
              {selectedOrg.source === 'stripe' ? (
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldOff size={14} /> Subscrição paga via Stripe — não pode ser revogada por aqui.
                </p>
              ) : (
                <>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 0.75rem' }}>
                    Esta organização está numa cortesia concedida manualmente. Revogar devolve-a ao plano Semente
                    imediatamente — se ficar acima dos limites, fica "bloqueada" até o admin da organização ajustar.
                  </p>

                  {revokeError && <p style={{ fontSize: '0.8rem', color: '#fca5a5', marginBottom: '0.75rem' }}>{revokeError}</p>}

                  {!confirmingRevoke ? (
                    <button className="danger-btn" onClick={() => setConfirmingRevoke(true)}>
                      Revogar cortesia
                    </button>
                  ) : (
                    <div className="warning-box" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                        <div>
                          Tens a certeza? <strong>{selectedOrg.org_name}</strong> perde o acesso ao plano{' '}
                          {selectedOrg.plan_name} imediatamente.
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button className="danger-btn" onClick={handleRevoke} disabled={revoking}>
                          {revoking ? 'A revogar…' : 'Confirmar revogação'}
                        </button>
                        <button className="ghost-btn" onClick={() => setConfirmingRevoke(false)} disabled={revoking}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
