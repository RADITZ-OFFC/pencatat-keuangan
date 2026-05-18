import React, { useState } from 'react'
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, List, BarChart2, TrendingUp, TrendingDown, X } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import AddExpense from './pages/AddExpense'
import AddIncome from './pages/AddIncome'
import ExpenseList from './pages/ExpenseList'
import IncomeList from './pages/IncomeList'
import Summary from './pages/Summary'
import AuthPage from './pages/AuthPage'
import { useExpenses } from './hooks/useExpenses'
import { useIncome } from './hooks/useIncome'
import { useBudget } from './hooks/useBudget'
import { useOnboarding } from './hooks/useOnboarding'
import { useAccentColor } from './hooks/useAccentColor'
import { useAuth } from './hooks/useAuth'
import Onboarding from './components/Onboarding'
import PageTransition from './components/PageTransition'
import AccentPicker from './components/AccentPicker'
import UserMenu from './components/UserMenu'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: null, icon: PlusCircle, label: 'Tambah' }, // null = trigger sheet
  { to: '/daftar', icon: List, label: 'Daftar' },
  { to: '/ringkasan', icon: BarChart2, label: 'Ringkasan' },
]

// Bottom sheet pilihan tambah
function AddSheet({ visible, onClose, onSelect }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className="fixed left-0 right-0 z-50 transition-transform duration-300 ease-out"
        style={{
          bottom: 0,
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        <div
          className="bg-[#16161d] border-t border-white/10 rounded-t-3xl max-w-lg mx-auto shadow-2xl"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>

          <div className="px-5 pb-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-bold text-white">Catat Transaksi</p>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-2">
              {/* Pengeluaran */}
              <button
                onClick={() => onSelect('pengeluaran')}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all"
              >
                <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center">
                  <TrendingDown className="w-7 h-7 text-red-400" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-white text-sm">Pengeluaran</p>
                  <p className="text-xs text-gray-500 mt-0.5">Catat belanja & biaya</p>
                </div>
              </button>

              {/* Pemasukan */}
              <button
                onClick={() => onSelect('pemasukan')}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 transition-all"
              >
                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-white text-sm">Pemasukan</p>
                  <p className="text-xs text-gray-500 mt-0.5">Catat gaji & pendapatan</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function AppContent({ expenseHook, incomeHook, budgetHook, accent, accentId, setAccent, user, getDisplayName, getAvatar, signOut }) {
  const [showAddSheet, setShowAddSheet] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()

  const handleNavTambah = (e) => {
    e.preventDefault()
    setShowAddSheet(true)
  }

  const handleSelect = (type) => {
    setShowAddSheet(false)
    setTimeout(() => {
      navigate(type === 'pemasukan' ? '/tambah-pemasukan' : '/tambah')
    }, 200)
  }

  // Active state for Tambah button
  const isTambahActive = location.pathname === '/tambah' || location.pathname === '/tambah-pemasukan'

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-[#0f0f13]">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-700"
          style={{ background: accent.primary }} />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="sticky top-0 z-30 w-full bg-[#0f0f13]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between">
          <AccentPicker accentId={accentId} onSelect={setAccent} />
          <UserMenu user={user} getDisplayName={getDisplayName} getAvatar={getAvatar} onSignOut={signOut} />
        </div>
      </div>

      {/* Main Content */}
      <main
        className="flex-1 max-w-lg mx-auto w-full px-4 pt-4 relative z-10"
        style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <PageTransition>
          <Routes>
            <Route path="/" element={
              <Dashboard
                {...expenseHook}
                incomes={incomeHook.incomes}
                addIncome={incomeHook.addIncome}
                deleteIncome={incomeHook.deleteIncome}
                updateIncome={incomeHook.updateIncome}
                {...budgetHook}
                userName={getDisplayName()}
              />
            } />
            <Route path="/tambah" element={<AddExpense {...expenseHook} />} />
            <Route path="/tambah-pemasukan" element={<AddIncome {...incomeHook} />} />
            <Route path="/daftar" element={<ExpenseList {...expenseHook} incomes={incomeHook.incomes} deleteIncome={incomeHook.deleteIncome} updateIncome={incomeHook.updateIncome} />} />
            <Route path="/daftar-pemasukan" element={<IncomeList {...incomeHook} />} />
            <Route path="/ringkasan" element={
              <Summary {...expenseHook} incomes={incomeHook.incomes} {...budgetHook} />
            } />
          </Routes>
        </PageTransition>
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 px-4"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-lg mx-auto pb-3">
          <div className="glass rounded-2xl flex overflow-hidden shadow-2xl shadow-black/60">
            {navItems.map(({ to, icon: Icon, label }) => {
              // Special "Tambah" button
              if (to === null) {
                return (
                  <button
                    key="tambah"
                    onClick={handleNavTambah}
                    className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-all duration-200 relative ${
                      isTambahActive ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {isTambahActive && (
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                        style={{ background: accent.primary }} />
                    )}
                    <Icon className="w-5 h-5" strokeWidth={isTambahActive ? 2.5 : 1.8}
                      style={isTambahActive ? { color: accent.primary } : {}} />
                    <span style={isTambahActive ? { color: accent.primary } : {}}>{label}</span>
                  </button>
                )
              }

              return (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-all duration-200 relative ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                          style={{ background: accent.primary }} />
                      )}
                      <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8}
                        style={isActive ? { color: accent.primary } : {}} />
                      <span style={isActive ? { color: accent.primary } : {}}>{label}</span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Add Sheet */}
      <AddSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onSelect={handleSelect}
      />
    </div>
  )
}

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut, getDisplayName, getAvatar } = useAuth()
  const expenseHook = useExpenses(user?.id)
  const incomeHook  = useIncome(user?.id)
  const budgetHook  = useBudget()
  const { onboardingDone, finishOnboarding } = useOnboarding()
  const { accent, accentId, setAccent } = useAccentColor()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
        <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-900/50">
          <span className="text-2xl">💰</span>
        </div>
      </div>
    )
  }

  if (!user) return <AuthPage onSignIn={signIn} onSignUp={signUp} />
  if (!onboardingDone) return <Onboarding onFinish={finishOnboarding} />

  return (
    <AppContent
      expenseHook={expenseHook}
      incomeHook={incomeHook}
      budgetHook={budgetHook}
      accent={accent}
      accentId={accentId}
      setAccent={setAccent}
      user={user}
      getDisplayName={getDisplayName}
      getAvatar={getAvatar}
      signOut={signOut}
    />
  )
}
