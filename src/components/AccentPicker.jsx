import React from 'react'
import { Check } from 'lucide-react'
import { ACCENT_COLORS } from '../hooks/useAccentColor'

export default function AccentPicker({ accentId, onSelect }) {
  return (
    <div className="flex items-center gap-2">
      {ACCENT_COLORS.map((color) => (
        <button
          key={color.id}
          onClick={() => onSelect(color.id)}
          title={color.label}
          aria-label={`Tema ${color.label}`}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90
            ${accentId === color.id ? 'ring-2 ring-offset-2 ring-offset-transparent scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'}
          `}
          style={{
            background: `linear-gradient(135deg, ${color.primary}, ${color.light})`,
            ringColor: color.primary,
          }}
        >
          {accentId === color.id && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </button>
      ))}
    </div>
  )
}
