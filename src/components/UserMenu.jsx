import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { LogOut, ChevronDown, X, Mail, Lock, Check, Loader2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'

function ChangeEmailForm({ currentEmail, onClose }) {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState(null)
  const [err, setErr]         = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || email === currentEmail) { setErr('Masukkan email baru yang berbeda'); return }
    setLoading(true); setErr(null)
    const { error } = await supabase.auth.updateUser({ email })
    setLoading(false)
    if (error) setErr(error.message)
    else setMsg('Email berhasil diperbarui! Cek inbox untuk konfirmasi.')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs text-gray-500">Email saat ini: <span className="text-gray-300">{currentEmail}</span></p>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="Email baru" className="input-field" style={{ fontSize: '16px' }} />
      {err && <p className="text-xs text-red-400">{err}</p>}
      {msg && <p className="text-xs text-emerald-400">{msg}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm py-2">Batal</button>
        <button type="submit" disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-all active:scale-95 disabled:opacity-40">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Simpan
        </button>
      </div>
    </form>
  )
}

function ChangePasswordForm({ onClose, onSignOut }) {
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showCon, setShowCon] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState(null)
  const [err, setErr]         = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPass.length < 6) { setErr('Password baru minimal 6 karakter'); return }
    if (newPass !== confirm) { setErr('Konfirmasi password tidak cocok'); return }
    setLoading(true); setErr(null)
    const { error } = await supabase.auth.updateUser({ password: newPass })
    setLoading(false)
    if (error) setErr(error.message)
    else {
      setMsg('Password berhasil diubah! Silakan login ulang.')
      setTimeout(async () => {
        await supabase.auth.signOut()
      }, 1500)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <input type={showNew ? 'text' : 'password'} value={newPass} onChange={(e) => setNewPass(e.target.value)}
          placeholder="Password baru" className="input-field pr-10" style={{ fontSize: '16px' }} />
        <button type="button" onClick={() => setShowNew(!showNew)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <div className="relative">
        <input type={showCon ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)}
          placeholder="Konfirmasi password baru" className="input-field pr-10" style={{ fontSize: '16px' }} />
        <button type="button" onClick={() => setShowCon(!showCon)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          {showCon ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {err && <p className="text-xs text-red-400">{err}</p>}
      {msg && <p className="text-xs text-emerald-400">{msg}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm py-2">Batal</button>
        <button type="submit" disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-all active:scale-95 disabled:opacity-40">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Simpan
        </button>
      </div>
    </form>
  )
}

function Modal({ visible, onClose, children }) {
  // Render langsung ke document.body via Portal — bypass semua z-index parent
  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        background: visible ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(8px)' : 'none',
        WebkitBackdropFilter: visible ? 'blur(8px)' : 'none',
        transition: 'background 0.2s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
          transition: 'opacity 0.25s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

export default function UserMenu({ user, getDisplayName, getAvatar, onSignOut }) {
  const [open, setOpen]       = useState(false)
  const [visible, setVisible] = useState(false)
  const [panel, setPanel]     = useState(null)

  const name     = getDisplayName()
  const avatar   = getAvatar()
  const initials = name.slice(0, 2).toUpperCase()

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
      setPanel(null)
    }
  }, [open])

  // Lock body scroll saat modal terbuka
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => setOpen(false), 250)
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 glass px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition-colors active:scale-95"
      >
        {avatar ? (
          <img src={avatar} alt={name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
        )}
        <span className="text-xs text-gray-300 font-medium max-w-[70px] truncate">{name}</span>
        <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
      </button>

      {/* Portal Modal */}
      {open && (
        <Modal visible={visible} onClose={handleClose}>
          <div style={{
            background: '#1a1a28',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          }}>
            {/* User info header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
              {avatar ? (
                <img src={avatar} alt={name} style={{ width: 48, height: 48, borderRadius: '0.75rem', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 48, height: 48, borderRadius: '0.75rem', flexShrink: 0,
                  background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '1.125rem', fontWeight: 700,
                }}>
                  {initials}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{user.email}</p>
              </div>
              <button onClick={handleClose} style={{
                width: 32, height: 32, borderRadius: '0.75rem', border: 'none',
                background: 'rgba(255,255,255,0.06)', color: '#9ca3af', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 1.25rem' }} />

            {/* Sub-panel: change email */}
            {panel === 'email' && (
              <div style={{ padding: '1.25rem' }}>
                <p style={{ fontWeight: 600, color: 'white', marginBottom: '0.75rem', fontSize: '0.875rem' }}>Ganti Email</p>
                <ChangeEmailForm currentEmail={user.email} onClose={() => setPanel(null)} />
              </div>
            )}

            {/* Sub-panel: change password */}
            {panel === 'password' && (
              <div style={{ padding: '1.25rem' }}>
                <p style={{ fontWeight: 600, color: 'white', marginBottom: '0.75rem', fontSize: '0.875rem' }}>Ganti Password</p>
                <ChangePasswordForm onClose={() => setPanel(null)} onSignOut={onSignOut} />
              </div>
            )}

            {/* Main menu */}
            {!panel && (
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { icon: <Mail size={16} color="#60a5fa" />, bg: 'rgba(59,130,246,0.15)', label: 'Ganti Email', action: () => setPanel('email') },
                  { icon: <Lock size={16} color="#a78bfa" />, bg: 'rgba(139,92,246,0.15)', label: 'Ganti Password', action: () => setPanel('password') },
                ].map((item) => (
                  <button key={item.label} onClick={item.action} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem 1rem', borderRadius: '0.875rem',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                    color: '#d1d5db', fontWeight: 500, fontSize: '0.875rem',
                    cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'background 0.15s',
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: '0.625rem', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    {item.label}
                  </button>
                ))}

                {/* Logout */}
                <button onClick={async () => { handleClose(); await onSignOut() }} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.875rem 1rem', borderRadius: '0.875rem',
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171', fontWeight: 500, fontSize: '0.875rem',
                  cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'background 0.15s',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: '0.625rem', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <LogOut size={16} color="#f87171" />
                  </div>
                  Keluar dari akun
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
