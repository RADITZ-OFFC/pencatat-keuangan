import React, { useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowUpRight, Sparkles, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { formatCurrency, getCategoryById, MONTHS, CATEGORY_GRADIENTS } from '../lib/constants'
import { generateInsights } from '../lib/insights'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { useStreak } from '../hooks/useStreak'
import { haptic } from '../lib/haptic'
import ExpenseCard from '../components/ExpenseCard'
import IncomeCard from '../components/IncomeCard'
import EditModal from '../components/EditModal'
import InsightCard from '../components/InsightCard'
import BudgetManager from '../components/BudgetManager'
import StreakBadge from '../components/StreakBadge'
import Confetti from '../components/Confetti'
import SwipeableCard from '../components/SwipeableCard'
import PWABanner from '../components/PWABanner'
import { useUndoToast } from '../components/UndoToast'
import { DashboardSkeleton } from '../components/Skeleton'

export default function Dashboard({
  expenses, loading, deleteExpense, updateExpense, addExpense,
  incomes, addIncome, deleteIncome, updateIncome,
  budgets, setBudget, removeBudget,
  userName,
}) {
  const [editingExpense, setEditingExpense] = useState(null)
  const [showConfetti, setShowConfetti]     = useState(false)
  const [activeTab, setActiveTab]           = useState('pengeluaran')
  const { showUndo, UndoToast } = useUndoToast()

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear  = now.getFullYear()

  const monthlyExpenses = useMemo(
    () => expenses.filter((e) => {
      const d = new Date(e.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    }),
    [expenses, currentMonth, currentYear]
  )

  const monthlyIncomes = useMemo(
    () => incomes.filter((i) => {
      const d = new Date(i.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    }),
    [incomes, currentMonth, currentYear]
  )

  const prevMonthExpenses = useMemo(() => {
    const pm = currentMonth === 0 ? 11 : currentMonth - 1
    const py = currentMonth === 0 ? currentYear - 1 : currentYear
    return expenses.filter((e) => {
      const d = new Date(e.date)
      return d.getMonth() === pm && d.getFullYear() === py
    })
  }, [expenses, currentMonth, currentYear])

  const totalExpense = useMemo(() => monthlyExpenses.reduce((s, e) => s + e.amount, 0), [monthlyExpenses])
  const totalIncome  = useMemo(() => monthlyIncomes.reduce((s, i) => s + i.amount, 0), [monthlyIncomes])
  const balance      = totalIncome - totalExpense

  const animatedExpense = useAnimatedNumber(totalExpense, 900)
  const animatedIncome  = useAnimatedNumber(totalIncome, 900)
  const animatedBalance = useAnimatedNumber(Math.abs(balance), 900)

  const spentByCategory = useMemo(() => {
    const map = {}
    monthlyExpenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount })
    return map
  }, [monthlyExpenses])

  const topCategories = useMemo(() => {
    return Object.entries(spentByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, amount]) => ({ ...getCategoryById(id), amount, pct: totalExpense > 0 ? (amount / totalExpense) * 100 : 0 }))
  }, [spentByCategory, totalExpense])

  const insights = useMemo(
    () => generateInsights(monthlyExpenses, prevMonthExpenses, budgets),
    [monthlyExpenses, prevMonthExpenses, budgets]
  )

  const { current: streakCurrent, longest: streakLongest, recordedToday } = useStreak(expenses)

  const totalBudget   = Object.values(budgets).reduce((s, v) => s + v, 0)
  const isUnderBudget = totalBudget > 0 && totalExpense < totalBudget * 0.5 && monthlyExpenses.length >= 5

  const handleDelete = useCallback(async (id, receiptUrl) => {
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

  const recentExpenses = expenses.slice(0, 5)
  const recentIncomes  = incomes.slice(0, 5)

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-5">
      <Confetti active={showConfetti} onDone={() => setShowConfetti(false)} />
      {UndoToast}

      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-gray-400 text-sm">Halo, {userName || 'Pengguna'} 👋</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">Keuanganku</h1>
        </div>
        <StreakBadge current={streakCurrent} longest={streakLongest} recordedToday={recordedToday} />
      </div>

      {/* Cashflow Hero Card */}
      <div
        className="relative rounded-3xl overflow-hidden p-5"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative z-10 mb-4">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
            <Wallet className="w-3.5 h-3.5" />
            <span>Saldo Bulan Ini</span>
          </div>
          <p className={`text-3xl font-bold tabular-nums ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {balance >= 0 ? '+' : '-'}{formatCurrency(animatedBalance)}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">
            {MONTHS[currentMonth]} {currentYear}{balance >= 0 ? ' · Surplus 🎉' : ' · Defisit ⚠️'}
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Pemasukan</span>
            </div>
            <p className="text-base font-bold text-white tabular-nums">{formatCurrency(animatedIncome)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{monthlyIncomes.length} transaksi</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-red-400 font-medium">Pengeluaran</span>
            </div>
            <p className="text-base font-bold text-white tabular-nums">{formatCurrency(animatedExpense)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{monthlyExpenses.length} transaksi</p>
          </div>
        </div>

        {(totalIncome > 0 || totalExpense > 0) && (
          <div className="relative z-10 mt-4">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${totalIncome > 0 ? Math.min((totalIncome / (totalIncome + totalExpense)) * 100, 100) : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Pemasukan</span>
              <span>Pengeluaran</span>
            </div>
          </div>
        )}
      </div>

      {insights.length > 0 && <InsightCard insights={insights} />}

      {topCategories.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Pengeluaran terbesar</p>
          <div className="grid grid-cols-3 gap-3">
            {topCategories.map((cat) => (
              <div key={cat.id} className="card card-hover text-center">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${CATEGORY_GRADIENTS[cat.id]} flex items-center justify-center text-lg mx-auto mb-2`}>
                  {cat.icon}
                </div>
                <p className="text-xs text-gray-400 truncate">{cat.label}</p>
                <p className="text-sm font-bold text-white mt-0.5">{cat.pct.toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <BudgetManager budgets={budgets} setBudget={setBudget} removeBudget={removeBudget} spentByCategory={spentByCategory} />
      <PWABanner />

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex glass rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveTab('pengeluaran')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'pengeluaran' ? 'bg-red-500/30 text-red-300' : 'text-gray-500'}`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => setActiveTab('pemasukan')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'pemasukan' ? 'bg-emerald-500/30 text-emerald-300' : 'text-gray-500'}`}
            >
              Pemasukan
            </button>
          </div>
          <Link
            to={activeTab === 'pengeluaran' ? '/daftar' : '/daftar-pemasukan'}
            className="flex items-center gap-1 text-xs text-violet-400 font-medium"
          >
            Lihat semua <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {activeTab === 'pengeluaran' ? (
          recentExpenses.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-3xl mb-2">💸</p>
              <p className="font-semibold text-gray-300 text-sm">Belum ada pengeluaran</p>
              <Link to="/tambah" className="inline-flex items-center gap-2 mt-3 btn-primary text-sm">
                <Plus className="w-4 h-4" /> Catat Sekarang
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <SwipeableCard key={expense.id} onDelete={() => handleDelete(expense.id, expense.receipt_url)}>
                  <ExpenseCard expense={expense} onDelete={handleDelete} onEdit={setEditingExpense} />
                </SwipeableCard>
              ))}
            </div>
          )
        ) : (
          recentIncomes.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-3xl mb-2">💰</p>
              <p className="font-semibold text-gray-300 text-sm">Belum ada pemasukan</p>
              <Link to="/tambah-pemasukan" className="inline-flex items-center gap-2 mt-3 text-sm font-semibold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 transition-all">
                <Plus className="w-4 h-4" /> Catat Sekarang
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentIncomes.map((income) => (
                <IncomeCard key={income.id} income={income} onDelete={deleteIncome} onEdit={updateIncome} />
              ))}
            </div>
          )
        )}
      </div>

      {editingExpense && (
        <EditModal expense={editingExpense} onClose={() => setEditingExpense(null)} onSave={updateExpense} />
      )}
    </div>
  )
}
