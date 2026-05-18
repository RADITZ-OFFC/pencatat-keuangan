import React, { useState } from 'react'
import { Trash2, Pencil, Receipt, X } from 'lucide-react'
import { getCategoryById, formatCurrency, formatDateShort, CATEGORY_GRADIENTS } from '../lib/constants'
import { haptic } from '../lib/haptic'

export default function ExpenseCard({ expense, onDelete, onEdit }) {
  const [showReceipt, setShowReceipt]     = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const category = getCategoryById(expense.category)

  const handleEditClick = () => {
    haptic.light()
    onEdit(expense)
  }

  const handleDeleteConfirm = () => {
    haptic.heavy()
    setConfirmDelete(false)
    onDelete(expense.id, expense.receipt_url)
  }

  return (
    <div
      className="group rounded-2xl p-4 transition-all duration-200 active:scale-[0.98]"
      style={{ background: '#16161d', border: '1px solid rgba(255,255,255,0.1)', isolation: 'isolate' }}
    >
      <div className="flex items-center gap-3">
        {/* Category icon */}
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${CATEGORY_GRADIENTS[expense.category] || 'from-gray-500 to-slate-500'} flex items-center justify-center text-xl flex-shrink-0 shadow-lg`}>
          {category.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate leading-tight">{expense.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${category.color}`}>
              {category.label}
            </span>
            <span className="text-xs text-gray-400 font-medium">{formatDateShort(expense.date)}</span>
          </div>
        </div>

        {/* Amount + Actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="font-bold text-red-400 text-sm tabular-nums">
            -{formatCurrency(expense.amount)}
          </span>
          <div className="flex items-center gap-1">
            {expense.receipt_url && (
              <button
                onClick={() => { haptic.light(); setShowReceipt(!showReceipt) }}
                className="p-2 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
                title="Lihat struk"
              >
                <Receipt className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleEditClick}
              className="p-2 text-gray-300 bg-white/5 hover:bg-white/15 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => { haptic.medium(); setConfirmDelete(true) }}
              className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Note */}
      {expense.note && (
        <p className="text-xs text-gray-400 mt-2 pl-14 line-clamp-1">{expense.note}</p>
      )}

      {/* Receipt preview */}
      {showReceipt && expense.receipt_url && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Receipt className="w-3 h-3" /> Foto Struk
            </span>
            <button onClick={() => setShowReceipt(false)} className="text-gray-500 hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          <img
            src={expense.receipt_url}
            alt="Struk"
            className="w-full max-h-56 object-contain rounded-xl border border-white/10 bg-white/5"
          />
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-300 font-medium">Hapus pengeluaran ini?</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="btn-secondary text-xs py-1.5 px-3">
              Batal
            </button>
            <button onClick={handleDeleteConfirm} className="btn-danger text-xs py-1.5 px-3">
              Hapus
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
