import { useState, useEffect } from 'react'

const KEY = 'pencatat_accent'

export const ACCENT_COLORS = [
  {
    id: 'violet',
    label: 'Violet',
    primary: '#7c3aed',
    light: '#a78bfa',
    tailwind: 'from-violet-600 to-indigo-600',
    bg: 'bg-violet-600',
    ring: 'ring-violet-500',
    text: 'text-violet-400',
    css: { '--accent': '#7c3aed', '--accent-light': '#a78bfa', '--accent-ring': 'rgba(124,58,237,0.5)' },
  },
  {
    id: 'blue',
    label: 'Biru',
    primary: '#2563eb',
    light: '#60a5fa',
    tailwind: 'from-blue-600 to-cyan-500',
    bg: 'bg-blue-600',
    ring: 'ring-blue-500',
    text: 'text-blue-400',
    css: { '--accent': '#2563eb', '--accent-light': '#60a5fa', '--accent-ring': 'rgba(37,99,235,0.5)' },
  },
  {
    id: 'emerald',
    label: 'Hijau',
    primary: '#059669',
    light: '#34d399',
    tailwind: 'from-emerald-600 to-teal-500',
    bg: 'bg-emerald-600',
    ring: 'ring-emerald-500',
    text: 'text-emerald-400',
    css: { '--accent': '#059669', '--accent-light': '#34d399', '--accent-ring': 'rgba(5,150,105,0.5)' },
  },
  {
    id: 'rose',
    label: 'Rose',
    primary: '#e11d48',
    light: '#fb7185',
    tailwind: 'from-rose-600 to-pink-500',
    bg: 'bg-rose-600',
    ring: 'ring-rose-500',
    text: 'text-rose-400',
    css: { '--accent': '#e11d48', '--accent-light': '#fb7185', '--accent-ring': 'rgba(225,29,72,0.5)' },
  },
  {
    id: 'amber',
    label: 'Amber',
    primary: '#d97706',
    light: '#fbbf24',
    tailwind: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500',
    ring: 'ring-amber-500',
    text: 'text-amber-400',
    css: { '--accent': '#d97706', '--accent-light': '#fbbf24', '--accent-ring': 'rgba(217,119,6,0.5)' },
  },
]

export function useAccentColor() {
  const [accentId, setAccentId] = useState(() => localStorage.getItem(KEY) || 'violet')

  const accent = ACCENT_COLORS.find((c) => c.id === accentId) || ACCENT_COLORS[0]

  useEffect(() => {
    // Apply CSS variables to :root so non-Tailwind elements also pick up the color
    const root = document.documentElement
    Object.entries(accent.css).forEach(([k, v]) => root.style.setProperty(k, v))
    localStorage.setItem(KEY, accentId)
  }, [accentId, accent])

  const setAccent = (id) => setAccentId(id)

  return { accent, accentId, setAccent, ACCENT_COLORS }
}
