import React, { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { CATEGORIES } from '../lib/constants'

export default function FilterBar({ onFilter }) {
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState({ category: '', startDate: '', endDate: '' })

  const hasActive = filters.category || filters.startDate || filters.endDate

  const handleChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value }
    setFilters(updated)
    onFilter(updated)
  }

  const handleReset = () => {
    const reset = { category: '', startDate: '', endDate: '' }
    setFilters(reset)
    onFilter(reset)
  }

  return (
    <div className="card">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Filter</span>
          {hasActive && (
            <span className="bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              Aktif
            </span>
          )}
        </div>
        <span className="text-gray-600 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
          {/* Category chips */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Kategori</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
              <button
                onClick={() => { const u = { ...filters, category: '' }; setFilters(u); onFilter(u) }}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${!filters.category ? 'bg-violet-600 border-violet-500 text-white' : 'border-white/15 text-gray-400'}`}
              >
                Semua
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { const u = { ...filters, category: cat.id }; setFilters(u); onFilter(u) }}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${filters.category === cat.id ? 'bg-violet-600 border-violet-500 text-white' : 'border-white/15 text-gray-400'}`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Dari</p>
              <input type="date" name="startDate" value={filters.startDate} onChange={handleChange} className="input-field text-sm" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Sampai</p>
              <input type="date" name="endDate" value={filters.endDate} onChange={handleChange} className="input-field text-sm" />
            </div>
          </div>

          {hasActive && (
            <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium transition-colors">
              <X className="w-3 h-3" /> Reset semua filter
            </button>
          )}
        </div>
      )}
    </div>
  )
}
