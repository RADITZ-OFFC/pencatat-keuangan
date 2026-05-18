import React, { useState, useMemo } from 'react'
import { SearchX, Download } from 'lucide-react'
import IncomeCard from '../components/IncomeCard'
import SearchBar from '../components/SearchBar'
import { ListSkeleton } from '../components/Skeleton'
import { formatDate, formatCurrency } from '../lib/constants'
import { exportToCsv } from '../lib/exportCsv'

export default function IncomeList({ incomes, loading, deleteIncome, updateIncome }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [exporting, setExporting]     = useState(false)

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return incomes
    const q = searchQuery.toLowerCase()
    return incomes.filter((i) => i.title.toLowerCase().includes(q) || (i.note || '').toLowerCase().includes(q))
  }, [incomes, searchQuery])

  const totalShown = useMemo(() => filtered.reduce((s, i) => s + i.amount, 0), [filtered])

  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach((i) => {
      if (!map[i.date]) map[i.date] = []
      map[i.date].push(i)
    })
    return Object.entries(map).sort((a, b) => new Date(b[0]) - new Date(a[0]))
  }, [filtered])

  const handleExport = () => {
    setExporting(true)
    // Reuse exportToCsv with income data mapped
    const mapped = incomes.map((i) => ({ ...i, category: i.category }))
    setTimeout(() => {
      exportToCsv(mapped, 'pemasukan.csv')
      setExporting(false)
    }, 300)
  }

  if (loading) return <ListSkeleton />

  return (
    <div className="space-y-4">
      <div className="pt-2 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pemasukan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {searchQuery ? `${filtered.length} hasil` : `${incomes.length} transaksi`}
          </p>
        </div>
        {incomes.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-base font-bold text-emerald-400">{formatCurrency(totalShown)}</p>
          </div>
        )}
      </div>

      <SearchBar onSearch={setSearchQuery} placeholder="Cari pemasukan..." />

      {grouped.length === 0 ? (
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
          {grouped.map(([date, items]) => (
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
      )}
    </div>
  )
}
