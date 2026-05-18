import React from 'react'
import { X } from 'lucide-react'
import ExpenseForm from './ExpenseForm'

export default function EditModal({ expense, onClose, onSave }) {
  const handleSubmit = async (data, file) => {
    const { error } = await onSave(expense.id, data, file)
    if (!error) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-[#1a1a24] border border-white/10 rounded-t-3xl w-full max-w-lg shadow-2xl overflow-y-auto scrollbar-hide"
        style={{ maxHeight: '92vh', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-[#1a1a24] z-10">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 sticky top-6 bg-[#1a1a24] z-10">
          <h2 className="text-base font-bold text-white">Edit Pengeluaran</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 pb-6">
          <ExpenseForm initialData={expense} onSubmit={handleSubmit} onCancel={onClose} />
        </div>
      </div>
    </div>
  )
}
