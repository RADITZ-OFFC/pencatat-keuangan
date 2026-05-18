import React, { useState } from 'react'
import { Wallet, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function AuthPage({ onSignIn, onSignUp }) {
  const [mode, setMode]         = useState('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(null)

  const translate = (msg) => {
    if (msg.includes('Invalid login'))       return 'Email atau password salah'
    if (msg.includes('Email not confirmed')) return 'Email belum dikonfirmasi, cek inbox kamu'
    if (msg.includes('already registered')) return 'Email sudah terdaftar, silakan login'
    if (msg.includes('rate limit'))          return 'Terlalu banyak percobaan, coba lagi nanti'
    return msg
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null); setSuccess(null)
    if (!email || !password)                 { setError('Email dan password wajib diisi'); return }
    if (mode === 'register' && !name.trim()) { setError('Nama wajib diisi'); return }
    if (password.length < 6)                 { setError('Password minimal 6 karakter'); return }

    setLoading(true)
    if (mode === 'login') {
      const { error: err } = await onSignIn(email, password)
      if (err) setError(translate(err.message))
    } else {
      const { error: err } = await onSignUp(email, password, name.trim())
      if (err) {
        setError(translate(err.message))
      } else {
        setSuccess('Akun berhasil dibuat! Silakan login.')
        setMode('login'); setEmail(''); setPassword('')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] flex flex-col items-center justify-center px-5 relative overflow-y-auto py-10">
      {/* Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-violet-900/50">
            <Wallet className="w-8 h-8 text-white" strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-bold text-white">Pencatat Keuangan</h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'login' ? 'Masuk ke akun kamu' : 'Buat akun baru'}
          </p>
        </div>

        <div className="glass rounded-3xl p-6 shadow-2xl">
          {/* Tab */}
          <div className="flex glass rounded-xl p-1 mb-5">
            {['login', 'register'].map((m) => (
              <button key={m}
                onClick={() => { setMode(m); setError(null); setSuccess(null) }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  mode === m
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {m === 'login' ? 'Masuk' : 'Daftar'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap" className="input-field pl-10" autoComplete="name" />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email" className="input-field pl-10" autoComplete="email" />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type={showPass ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" className="input-field pl-10 pr-10"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl px-4 py-3">
                {success}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 h-12 text-base mt-1">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                : mode === 'login' ? 'Masuk' : 'Buat Akun'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Data kamu tersimpan aman dan terisolasi per akun
        </p>
      </div>
    </div>
  )
}
