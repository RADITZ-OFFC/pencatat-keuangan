import React, { useState } from 'react'
import { formatCurrency } from '../lib/constants'

// Solid colors per category for SVG (no gradient in SVG stroke)
const DONUT_COLORS = {
  // Expense categories
  makanan:      '#f97316',
  transportasi: '#3b82f6',
  hobi:         '#8b5cf6',
  belanja:      '#ec4899',
  kesehatan:    '#10b981',
  pendidikan:   '#eab308',
  tagihan:      '#ef4444',
  lainnya:      '#6b7280',
  // Income categories
  gaji:         '#10b981',
  freelance:    '#3b82f6',
  bisnis:       '#8b5cf6',
  investasi:    '#f59e0b',
  hadiah:       '#ec4899',
  lainnya_in:   '#6b7280',
}

const SIZE = 180
const STROKE = 22
const R = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * R
const CENTER = SIZE / 2

export default function DonutChart({ data, total }) {
  const [hovered, setHovered] = useState(null)

  if (!data.length) return null

  // Build segments
  let offset = 0
  const segments = data.map((cat) => {
    const pct = cat.pct / 100
    const dash = pct * CIRCUMFERENCE
    const gap = CIRCUMFERENCE - dash
    const seg = { ...cat, dash, gap, offset, color: DONUT_COLORS[cat.id] || '#6b7280' }
    offset += dash
    return seg
  })

  const active = hovered ? data.find((d) => d.id === hovered) : null

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* SVG Donut — responsive */}
      <div className="relative" style={{ width: SIZE, height: SIZE, maxWidth: '100%' }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={CENTER} cy={CENTER} r={R}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={STROKE}
          />
          {/* Segments */}
          {segments.map((seg) => (
            <circle
              key={seg.id}
              cx={CENTER} cy={CENTER} r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth={hovered === seg.id ? STROKE + 4 : STROKE}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="round"
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHovered(seg.id)}
              onMouseLeave={() => setHovered(null)}
              onTouchStart={() => setHovered(seg.id)}
              onTouchEnd={() => setTimeout(() => setHovered(null), 1200)}
              style={{ filter: hovered === seg.id ? `drop-shadow(0 0 6px ${seg.color}80)` : 'none' }}
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {active ? (
            <>
              <span className="text-2xl mb-0.5">{active.icon}</span>
              <p className="text-xs font-bold text-white leading-tight">{active.label}</p>
              <p className="text-xs text-gray-400">{active.pct.toFixed(1)}%</p>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-0.5">Total</p>
              <p className="text-sm font-bold text-white leading-tight">
                {formatCurrency(total).replace('Rp\u00a0', 'Rp ')}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full">
        {data.map((cat) => (
          <button
            key={cat.id}
            onMouseEnter={() => setHovered(cat.id)}
            onMouseLeave={() => setHovered(null)}
            onTouchStart={() => setHovered(cat.id)}
            onTouchEnd={() => setTimeout(() => setHovered(null), 1200)}
            className={`flex items-center gap-2 text-left transition-opacity duration-150 ${
              hovered && hovered !== cat.id ? 'opacity-40' : 'opacity-100'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: DONUT_COLORS[cat.id] || '#6b7280' }}
            />
            <div className="min-w-0">
              <p className="text-xs text-gray-300 truncate">{cat.label}</p>
              <p className="text-xs font-semibold text-white">{cat.pct.toFixed(0)}%</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
