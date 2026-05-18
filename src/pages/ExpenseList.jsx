import React, { useState, useMemo, useCallback } from 'react'
import { SearchX, Download } from 'lucide-react'
import ExpenseCard from '../components/ExpenseCard'
import IncomeCard from '../components/IncomeCard'
import EditModal from '../components/EditModal'
import SearchBar from '../components/SearchBar'
import SwipeableCard from '../components/SwipeableCard'
import { ListSkeleton } from '../components/Skeleton'
import { useUndoToast } from '../components/UndoToast'
import { formatDate, formatCurrency } from '../lib/constants'
import { exportToCsv } from '../lib/exportCsv'
import { haptic } from '../lib/haptic'

export default function ExpenseList({
  expenses, loading, deleteExpense, updateExpense, addExpense,
  incomes, deleteIncome, updateIncome,
}) {
  const [activeTab, setActiveTab]          = useState('pengeluaran')
  const [editingExpense, setEditingExpense] = useState(null)
  const [exporting, setExporting]          = useState(false)
  const [searchQuery, setSearchQuery]      = useState('')
  const { showUndo, UndoToast } = useUndoToast()

  // Undo-aware delete expense
  const handleDeleteExpense = useCallback(async (id, receiptUrl) => {
    const target = expenses.find((e) => e.id === id)
    if (!target) return
    haptic.swipeDelete()
    const { error } = await deleteExpense(id, receiptUrl)
    if (!error) {
      showUndo('Pengeluaran dihapus', async () => {
        haptic.undo()
        await addExpense({ title: target.title, amount: target.amount, category: target.category, date: target.date, note: target.note || '' }, null)
      })
    }
  }, [expenses, deleteExpense, addExpense, showUndo])

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses
    const q = searchQuery.toLowerCase()
    return expenses.filter((e) => e.title.toLowerCase().includes(q) || (e.note || '').toLowerCase().includes(q))
  }, [expenses, searchQuery])

  // Filter incomes
  const filteredIncomes = useMemo(() => {
    if (!searchQuery.trim()) return incomes || []
    const q = searchQuery.toLowerCase()
    return (incomes || []).filter((i) => i.title.toLowerCase().includes(q) || (i.note || '').toLowerCase().includes(q))
  }, [incomes, searchQuery])

  const totalExpense = useMemo(() => filteredExpenses.reduce((s, e) => s + e.amount, 0), [filteredExpenses])
  const totalIncome  = useMemo(() => filteredIncomes.reduce((s, i) => s + i.amount, 0), [filteredIncomes])

  const groupedExpenses = useMemo(() => {
    const map = {}
    filteredExpenses.forEach((e) => {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    })
    return Object.entries(map).sort((a, b) => new Date(b[0]) - new Date(a[0]))
  }, [filteredExpenses])

  const groupedIncomes = useMemo(() => {
    const map = {}
    filteredIncomes.forEach((i) => {
      if (!map[i.date]) map[i.date] = []
      map[i.date].push(i)
    })
    return Object.entries(map).sort((a, b) => new Date(b[0]) - new Date(a[0]))
  }, [filteredIncomes])

  const handleExport = () => {
    haptic.medium()
    setExporting(true)
    const data = activeTab === 'pengeluaran' ? expenses : (incomes || [])
    const filename = activeTab === 'pengeluaran' ? 'pengeluaran.csv' : 'pemasukan.csv'
    setTimeout(() => { exportToCsv(data, filename); setExporting(false) }, 300)
  }

  if (loading) return <ListSkeleton />

  const isExpense = activeTab === 'pengeluaran'
  const currentTotal = isExpense ? totalExpense : totalIncome
  const currentCount = isExpense ? expenses.length : (incomes || []).length
  const currentFiltered = isExpense ? filteredExpenses.length : filteredIncomes.length

  return (
    <div className="space-y-4">
      {UndoToast}

      {/* Header */}
      <div className="pt-2 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Daftar Transaksi</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {searchQuery ? `${currentFiltered} hasil` : `${currentCount} transaksi`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentCount > 0 && (
            <>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total</p>
                <p className={`text-base font-bold ${isExpense ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isExpense ? '-' : '+'}{formatCurrency(currentTotal)}
                </p>
              </div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-9 h-9 glass rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors active:scale-95 disabled:opacity-50"
                title="Export CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex glass rounded-xl p-1 gap-1">
        <button
          onClick={() => { setActiveTab('pengeluaran'); setSearchQuery('') }}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'pengeluaran' ? 'bg-red-500/30 text-red-300' : 'text-gray-500'
          }`}
        >
          Pengeluaran
        </button>
        <button
          onClick={() => { setActiveTab('pemasukan'); setSearchQuery('') }}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'pemasukan' ? 'bg-emerald-500/30 text-emerald-300' : 'text-gray-500'
          }`}
        >
          Pemasukan
        </button>
      </div>

      <SearchBar
        onSearch={setSearchQuery}
        placeholder={isExpense ? 'Cari pengeluaran...' : 'Cari pemasukan...'}
      />

      {/* Expense list */}
      {isExpense && (
        groupedExpenses.length === 0 ? (
          <div className="card text-center py-14">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <SearchX className="w-8 h-8 text-gray-600" />
            </div>
            <p className="font-semibold text-gray-400">
              {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : 'Belum ada pengeluaran'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedExpenses.map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="glass rounded-xl px-3 py-1.5">
                    <p className="text-xs font-semibold text-gray-300">{formatDate(date)}</p>
                  </div>
                  <div className="flex-1 h-px bg-white/5" />
                  <p className="text-xs text-red-600">
                    -{formatCurrency(items.reduce((s, e) => s + e.amount, 0))}
                  </p>
                </div>
                <div className="space-y-3">
                  {items.map((expense) => (
                    <SwipeableCard key={expense.id} onDelete={() => handleDeleteExpense(expense.id, expense.receipt_url)}>
                      <ExpenseCard expense={expense} onDelete={handleDeleteExpense} onEdit={setEditingExpense} />
                    </SwipeableCard>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Income list */}
      {!isExpense && (
        groupedIncomes.length === 0 ? (
          <div className="card text-center py-14">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <SearchX className="w-8 h-8 text-gray-600" />
            </div>
            <p className="font-semibold text-gray-400">
              {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : 'Belum ada pemasukan'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedIncomes.map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="glass rounded-xl px-3 py-1.5">
                    <p className="text-xs font-semibold text-gray-300">{formatDate(date)}</p>
                  </div>
                  <div className="flex-1 h-px bg-white/5" />
                  <p className="text-xs text-emerald-600">
                    +{formatCurrency(items.reduce((s, i) => s + i.amount, 0))}
                  </p>
                </div>
                <div className="space-y-3">
                  {items.map((income) => (
                    <IncomeCard key={income.id} income={income} onDelete={deleteIncome} onEdit={updateIncome} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {editingExpense && (
        <EditModal expense={editingExpense} onClose={() => setEditingExpense(null)} onSave={updateExpense} />
      )}
    </div>
  )
}
