import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import type { GrowthPoint } from '../lib/types'

const COLOR_PROFILES = '#5b7fa6'
const COLOR_ORGS = '#5a9e6f'
const GRID = '#262a30'
const AXIS = '#363a42'
const MUTED = '#8b93a0'

function formatMonth(value: string | number | Date) {
  const d = new Date(value)
  return d.toLocaleDateString('pt-PT', { month: 'short' })
}

function formatMonthLabel(value: unknown) {
  return typeof value === 'string' ? formatMonth(value) : ''
}

export function GrowthChart({ data }: { data: GrowthPoint[] }) {
  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Crescimento (12 meses)</h2>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: '0.2rem 0 0' }}>
            Novos utilizadores e organizações por mês
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(255,255,255,0.7)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: COLOR_PROFILES, display: 'inline-block' }} />
            Pessoas
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(255,255,255,0.7)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: COLOR_ORGS, display: 'inline-block' }} />
            Organizações
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            stroke={AXIS}
            tick={{ fill: MUTED, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: AXIS }}
          />
          <YAxis
            allowDecimals={false}
            stroke={AXIS}
            tick={{ fill: MUTED, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            cursor={{ stroke: 'rgba(255,255,255,0.15)' }}
            contentStyle={{
              background: '#15171c',
              border: '1px solid rgba(148,163,184,0.18)',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              color: '#fff',
            }}
            labelFormatter={formatMonthLabel}
          />
          <Line
            type="monotone"
            dataKey="new_profiles"
            name="Pessoas"
            stroke={COLOR_PROFILES}
            strokeWidth={2}
            dot={{ r: 2.5, fill: COLOR_PROFILES, strokeWidth: 0 }}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="new_organizations"
            name="Organizações"
            stroke={COLOR_ORGS}
            strokeWidth={2}
            dot={{ r: 2.5, fill: COLOR_ORGS, strokeWidth: 0 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
