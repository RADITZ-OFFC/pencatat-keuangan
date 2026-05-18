import React, { useState, useRef, useEffect } from 'react'
import { X, Plus, Loader2, CheckCircle2 } from 'lucide-react'
import { CATEGORIES, CATEGORY_GRADIENTS, formatCurrency } from '../lib/constants'

// Quick preset amounts
const PRESETS = [5000, 10000, 15000, 20000, 25000, 50000]

export default function QuickAdd({ onAdd, onClose }) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('makanan')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [visible, setVisible] = useState(false)
  const inputRef = useRef(null)

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  const handlePreset = (val) => {
    setAmount(String(val))
  }

  const handleSubmit = async () => {
    if (!amount || !title.trim()) return
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    const { error } = await onAdd({ title: title.trim(), amount: Number(amount), category, date: today, note: '' }, null)
    setLoading(false)
    if (!error) {
      setDone(true)
      setTimeout(() => { handleClose() }, 1000)
    }
  }

  const selectedCat = CATEGORIES.find((c) => c.id === category)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out"
        style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
      >
        <div className="bg-[#16161d] border-t border-white/10 rounded-t-3xl max-w-lg mx-auto shadow-2xl overflow-y-auto max-h-[85vh]">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-[#16161d] z-10">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>

          <div className="px-5 pt-2" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}>
            {done ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="font-bold text-white">Tersimpan!</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-white">Catat Cepat</h3>
                  <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Amount input */}
                <div className="relative mb-3">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">Rp</span>
                  <input
                    ref={inputRef}
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="input-field pl-14 text-2xl font-bold h-14"
                  />
                </div>

                {/* Preset amounts */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePreset(p)}
                      className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${
                        amount === String(p)
                          ? 'bg-violet-600 border-violet-500 text-white'
                          : 'border-white/15 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      {formatCurrency(p)}
                    </button>
                  ))}
                </div>

                {/* Title */}
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Keterangan (contoh: Makan siang)"
                  className="input-field mb-4"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />

                {/* Category scroll */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 pb-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                        category === cat.id
                          ? 'border-violet-500/60 bg-violet-500/20 text-white'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !amount || !title.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2 h-12 text-base"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                  ) : (
                    <><Plus className="w-5 h-5" /> Simpan</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
