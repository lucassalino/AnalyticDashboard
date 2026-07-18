import type { ComponentType } from 'react'

interface StatCardProps {
  icon: ComponentType<{ size?: number; color?: string }>
  label: string
  value: number | string
  hint?: string
}

export function StatCard({ icon: Icon, label, value, hint }: StatCardProps) {
  return (
    <div className="glass-stat">
      <div className="stat-icon">
        <Icon size={18} color="rgba(255,255,255,0.85)" />
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          {value}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{label}</div>
      </div>
      {hint && (
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{hint}</div>
      )}
    </div>
  )
}
