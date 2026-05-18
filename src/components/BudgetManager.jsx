import React, { useState } from 'react'
import { Target, Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import { CATEGORIES, CATEGORY_GRADIENTS, formatCurrency } from '../lib/constants'

function BudgetRow({ cat, budget, spent, onSave, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(String(budget || ''))

  const pct    = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  const isOver = spent > budget && budget > 0
  const isWarn = pct >= 80 && !isOver

  const handleSave = () => {
    const num = Number(val)
    if (num > 0) { onSave(cat.id, num); setEditing(false) }
  }

  return (
    <div className="glass rounded-2xl p-4">
      {/* Row header */}
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${CATEGORY_GRADIENTS[cat.id]} flex items-center justify-center text-base flex-shrink-0`}>
          {cat.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{cat.label}</p>
          {budget > 0 && !editing && (
            <p className={`text-xs mt-0.5 ${isOver ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-gray-500'}`}>
              {formatCurrency(spent)} / {formatCurrency(budget)}
            </p>
          )}
          {!budget && !editing && (
            <p className="text-xs text-gray-600">Belum ada budget</p>
          )}
        </div>

        {!editing && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => { setVal(String(budget || '')); setEditing(true) }}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              {budget > 0 ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
            {budget > 0 && (
              <button
                onClick={() => onRemove(cat.id)}
                className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit form — full width below */}
      {editing && (
        <div className="flex flex-col gap-2 mt-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
            <input
              type="number"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              placeholder="Masukkan budget..."
              style={{ fontSize: '16px' }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/30 transition-colors active:scale-95"
            >
              <Check className="w-4 h-4" /> Simpan
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/5 text-gray-400 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors active:scale-95"
            >
              <X className="w-4 h-4" /> Batal
            </button>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {budget > 0 && !editing && (
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOver ? 'bg-red-500' : isWarn ? 'bg-amber-500' : `bg-gradient-to-r ${CATEGORY_GRADIENTS[cat.id]}`
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default function BudgetManager({ budgets, setBudget, removeBudget, spentByCategory }) {
  const [open, setOpen] = useState(false)

  const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0)
  const totalSpent  = Object.entries(budgets).reduce((s, [id, limit]) => s + Math.min(spentByCategory[id] || 0, limit), 0)
  const overCount   = CATEGORIES.filter((c) => budgets[c.id] && (spentByCategory[c.id] || 0) > budgets[c.id]).length

  return (
    <div className="card">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-500/20 rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Budget Bulanan</p>
            {totalBudget > 0 && (
              <p className="text-xs text-gray-500">
                {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
                {overCount > 0 && <span className="text-red-400 ml-1">· {overCount} over budget</span>}
              </p>
            )}
          </div>
        </div>
        <span className="text-gray-600 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
          {CATEGORIES.map((cat) => (
            <BudgetRow
              key={cat.id}
              cat={cat}
              budget={budgets[cat.id] || 0}
              spent={spentByCategory[cat.id] || 0}
              onSave={setBudget}
              onRemove={removeBudget}
            />
          ))}
        </div>
      )}
    </div>
  )
}
