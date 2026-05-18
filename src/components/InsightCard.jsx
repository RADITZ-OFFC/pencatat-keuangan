import React, { useState } from 'react'
import { Lightbulb, ChevronRight, X } from 'lucide-react'

const typeStyles = {
  info:    'border-blue-500/30 bg-blue-500/10',
  success: 'border-emerald-500/30 bg-emerald-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
  danger:  'border-red-500/30 bg-red-500/10',
}

const dotStyles = {
  info:    'bg-blue-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger:  'bg-red-400',
}

export default function InsightCard({ insights }) {
  const [dismissed, setDismissed] = useState([])
  const [expanded, setExpanded] = useState(false)

  const visible = insights.filter((_, i) => !dismissed.includes(i))
  if (!visible.length) return null

  const shown = expanded ? visible : visible.slice(0, 1)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Insight</p>
        </div>
        {visible.length > 1 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-0.5 transition-colors"
          >
            {expanded ? 'Sembunyikan' : `+${visible.length - 1} lainnya`}
            <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      {shown.map((insight, idx) => {
        const realIdx = insights.indexOf(insight)
        return (
          <div
            key={realIdx}
            className={`flex items-start gap-3 p-3 rounded-2xl border ${typeStyles[insight.type]} transition-all duration-300`}
          >
            <span className="text-lg flex-shrink-0 mt-0.5">{insight.icon}</span>
            <p className="text-sm text-gray-300 flex-1 leading-relaxed">{insight.text}</p>
            <button
              onClick={() => setDismissed((p) => [...p, realIdx])}
              className="text-gray-600 hover:text-gray-400 flex-shrink-0 mt-0.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
