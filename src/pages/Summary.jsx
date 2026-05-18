import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
import {
  formatCurrency, getCategoryById,
  CATEGORIES, INCOME_CATEGORIES,
  MONTHS, CATEGORY_GRADIENTS, INCOME_GRADIENTS,
  getIncomeCategoryById,
} from '../lib/constants'
import { exportMonthlySummary } from '../lib/exportCsv'
import BudgetManager from '../components/BudgetManager'
import DonutChart from '../components/DonutChart'

export default function Summary({ expenses, incomes = [], budgets, setBudget, removeBudget }) {
  const now = new Date()
  const [viewYear, setViewYear]   = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [activeTab, setActiveTab] = useState('pengeluaran')

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }
  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear()

  const monthlyExpenses = useMemo(
    () => expenses.filter((e) => {
      const d = new Date(e.date)
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear
    }),
    [expenses, viewMonth, viewYear]
  )

  const monthlyIncomes = useMemo(
    () => incomes.filter((i) => {
      const d = new Date(i.date)
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear
    }),
    [incomes, viewMonth, viewYear]
  )

  const totalExpense = useMemo(() => monthlyExpenses.reduce((s, e) => s + e.amount, 0), [monthlyExpenses])
  const totalIncome  = useMemo(() => monthlyIncomes.reduce((s, i) => s + i.amount, 0), [monthlyIncomes])
  const balance      = totalIncome - totalExpense

  const spentByCategory = useMemo(() => {
    const map = {}
    monthlyExpenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount })
    return map
  }, [monthlyExpenses])

  const incomeByCategory = useMemo(() => {
    const map = {}
    monthlyIncomes.forEach((i) => { map[i.category] = (map[i.category] || 0) + i.amount })
    return map
  }, [monthlyIncomes])

  const expenseCategoryData = useMemo(() => {
    return CATEGORIES
      .map((cat) => ({
        ...cat,
        amount: spentByCategory[cat.id] || 0,
        count: monthlyExpenses.filter((e) => e.category === cat.id).length,
        pct: totalExpense > 0 ? ((spentByCategory[cat.id] || 0) / totalExpense) * 100 : 0,
        budget: budgets[cat.id] || 0,
      }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)
  }, [monthlyExpenses, totalExpense, spentByCategory, budgets])

  const incomeCategoryData = useMemo(() => {
    return INCOME_CATEGORIES
      .map((cat) => ({
        ...cat,
        amount: incomeByCategory[cat.id] || 0,
        count: monthlyIncomes.filter((i) => i.category === cat.id).length,
        pct: totalIncome > 0 ? ((incomeByCategory[cat.id] || 0) / totalIncome) * 100 : 0,
      }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)
  }, [monthlyIncomes, totalIncome, incomeByCategory])

  // Donut data for income (reuse DonutChart with income colors)
  const incomeDonutData = useMemo(() => incomeCategoryData.map((cat) => ({
    ...cat,
    // DonutChart uses cat.id to look up DONUT_COLORS — add income colors
  })), [incomeCategoryData])

  const dailyData = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const expMap = {}
    const incMap = {}
    monthlyExpenses.forEach((e) => { const d = new Date(e.date).getDate(); expMap[d] = (expMap[d] || 0) + e.amount })
    monthlyIncomes.forEach((i)  => { const d = new Date(i.date).getDate(); incMap[d] = (incMap[d] || 0) + i.amount })
    const maxVal = Math.max(...Object.values(expMap), ...Object.values(incMap), 1)
    return Array.from({ length: daysInMonth }, (_, idx) => ({
      day: idx + 1,
      expense: expMap[idx + 1] || 0,
      income:  incMap[idx + 1] || 0,
      expPct: ((expMap[idx + 1] || 0) / maxVal) * 100,
      incPct: ((incMap[idx + 1] || 0) / maxVal) * 100,
    }))
  }, [monthlyExpenses, monthlyIncomes, viewMonth, viewYear])

  const peakExpDay = dailyData.reduce((max, d) => d.expense > max.expense ? d : max, { day: 0, expense: 0 })

  const avgPerDay = monthlyExpenses.length > 0
    ? totalExpense / [...new Set(monthlyExpenses.map((e) => e.date))].length
    : 0

  return (
    <div className="space-y-5">
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ringkasan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analisis keuangan bulanan</p>
        </div>
        <button
          onClick={() => exportMonthlySummary(expenses, viewMonth, viewYear)}
          className="flex items-center gap-1.5 glass px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-white transition-colors active:scale-95"
        >
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* Month Selector */}
      <div className="card">
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div className="text-center">
            <p className="font-bold text-white text-lg">{MONTHS[viewMonth]}</p>
            <p className="text-sm text-gray-500">{viewYear}</p>
          </div>
          <button onClick={nextMonth} disabled={isCurrentMonth}
            className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Cashflow 3 kolom */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Pemasukan</p>
            <p className="text-sm font-bold text-emerald-400">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-gray-600 mt-0.5">{monthlyIncomes.length} transaksi</p>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="text-xs text-gray-500 mb-1">Pengeluaran</p>
            <p className="text-sm font-bold text-red-400">{formatCurrency(totalExpense)}</p>
            <p className="text-xs text-gray-600 mt-0.5">{monthlyExpenses.length} transaksi</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Saldo</p>
            <p className={`text-sm font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">{balance >= 0 ? 'Surplus' : 'Defisit'}</p>
          </div>
        </div>

        {/* Rata-rata */}
        {avgPerDay > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10 text-center">
            <p className="text-xs text-gray-500">Rata-rata pengeluaran/hari</p>
            <p className="text-base font-bold text-amber-400 mt-0.5">{formatCurrency(avgPerDay)}</p>
          </div>
        )}
      </div>

      {/* Daily Chart — expense + income bars */}
      {(monthlyExpenses.length > 0 || monthlyIncomes.length > 0) && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-300">Grafik Harian</p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Masuk</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />Keluar</span>
            </div>
          </div>
          <div className="flex items-end gap-0.5 h-28">
            {dailyData.map(({ day, expense, income, expPct, incPct }) => (
              <div key={day} className="flex-1 flex items-end gap-px">
                {/* Income bar */}
                <div
                  className="flex-1 bg-emerald-500/60 rounded-t-sm transition-all duration-500"
                  style={{ height: `${Math.max(incPct, income > 0 ? 4 : 0)}%` }}
                />
                {/* Expense bar */}
                <div
                  className={`flex-1 rounded-t-sm transition-all duration-500 ${day === peakExpDay.day ? 'bg-violet-400' : 'bg-violet-600/50'}`}
                  style={{ height: `${Math.max(expPct, expense > 0 ? 4 : 0)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>1</span>
            <span>{Math.ceil(dailyData.length / 2)}</span>
            <span>{dailyData.length}</span>
          </div>
        </div>
      )}

      {/* Tab switcher rincian */}
      <div className="flex glass rounded-xl p-1 gap-1">
        <button
          onClick={() => setActiveTab('pengeluaran')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'pengeluaran' ? 'bg-red-500/30 text-red-300' : 'text-gray-500'}`}
        >
          Pengeluaran
        </button>
        <button
          onClick={() => setActiveTab('pemasukan')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'pemasukan' ? 'bg-emerald-500/30 text-emerald-300' : 'text-gray-500'}`}
        >
          Pemasukan
        </button>
      </div>

      {/* Expense breakdown */}
      {activeTab === 'pengeluaran' && (
        expenseCategoryData.length > 0 ? (
          <div className="card">
            <p className="text-sm font-semibold text-gray-300 mb-5">Rincian Pengeluaran</p>
            <div className="mb-6">
              <DonutChart data={expenseCategoryData} total={totalExpense} />
            </div>
            <div className="space-y-4 border-t border-white/10 pt-4">
              {expenseCategoryData.map((cat, i) => {
                const budgetPct = cat.budget > 0 ? Math.min((cat.amount / cat.budget) * 100, 100) : 0
                const isOver = cat.budget > 0 && cat.amount > cat.budget
                const isWarn = budgetPct >= 80 && !isOver
                return (
                  <div key={cat.id}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${CATEGORY_GRADIENTS[cat.id]} flex items-center justify-center text-base flex-shrink-0`}>
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-200">{cat.label}</p>
                          <div className="text-right">
                            <p className="text-sm font-bold text-white">{formatCurrency(cat.amount)}</p>
                            {cat.budget > 0 && (
                              <p className={`text-xs ${isOver ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-gray-500'}`}>
                                / {formatCurrency(cat.budget)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-gray-500">{cat.count} transaksi</p>
                          <p className="text-xs text-gray-500">{cat.pct.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden ml-12">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-red-500' : isWarn ? 'bg-amber-500' : `bg-gradient-to-r ${CATEGORY_GRADIENTS[cat.id]}`}`}
                        style={{ width: `${cat.pct}%`, transitionDelay: `${i * 80}ms` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-sm text-gray-400">Total Pengeluaran</p>
              <p className="text-base font-bold text-red-400">-{formatCurrency(totalExpense)}</p>
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-4xl mb-3">📊</p>
            <p className="font-semibold text-gray-400">Belum ada pengeluaran</p>
          </div>
        )
      )}

      {/* Income breakdown */}
      {activeTab === 'pemasukan' && (
        incomeCategoryData.length > 0 ? (
          <div className="card">
            <p className="text-sm font-semibold text-gray-300 mb-5">Rincian Pemasukan</p>

            {/* Donut chart pemasukan */}
            <div className="mb-6">
              <DonutChart data={incomeCategoryData} total={totalIncome} />
            </div>

            <div className="space-y-4 border-t border-white/10 pt-4">
              {incomeCategoryData.map((cat, i) => (
                <div key={cat.id}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${INCOME_GRADIENTS[cat.id] || 'from-emerald-500 to-teal-500'} flex items-center justify-center text-base flex-shrink-0`}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-200">{cat.label}</p>
                        <p className="text-sm font-bold text-emerald-400">+{formatCurrency(cat.amount)}</p>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-gray-500">{cat.count} transaksi</p>
                        <p className="text-xs text-gray-500">{cat.pct.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden ml-12">
                    <div
                      className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${INCOME_GRADIENTS[cat.id] || 'from-emerald-500 to-teal-500'}`}
                      style={{ width: `${cat.pct}%`, transitionDelay: `${i * 80}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-sm text-gray-400">Total Pemasukan</p>
              <p className="text-base font-bold text-emerald-400">+{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-4xl mb-3">💰</p>
            <p className="font-semibold text-gray-400">Belum ada pemasukan</p>
          </div>
        )
      )}

      {/* Budget Manager */}
      <BudgetManager budgets={budgets} setBudget={setBudget} removeBudget={removeBudget} spentByCategory={spentByCategory} />
    </div>
  )
}
