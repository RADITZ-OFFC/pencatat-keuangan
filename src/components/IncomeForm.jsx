import React, { useState, useRef } from 'react'
import { Loader2, Camera, X } from 'lucide-react'
import { INCOME_CATEGORIES } from '../lib/constants'

const getToday = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const getDefaultForm = () => ({
  title: '', amount: '', category: 'gaji', date: getToday(), note: '',
})

export default function IncomeForm({ onSubmit, initialData = null, onCancel }) {
  const [form, setForm] = useState(
    initialData
      ? { title: initialData.title, amount: String(initialData.amount), category: initialData.category, date: initialData.date, note: initialData.note || '' }
      : getDefaultForm()
  )
  const [receiptFile, setReceiptFile]       = useState(null)
  const [receiptPreview, setReceiptPreview] = useState(initialData?.receipt_url || null)
  const [loading, setLoading]               = useState(false)
  const [errors, setErrors]                 = useState({})
  const fileInputRef                        = useRef(null)

  React.useEffect(() => {
    if (!initialData) setForm((p) => ({ ...p, date: getToday() }))
  }, [])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Judul wajib diisi'
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Masukkan nominal yang valid'
    if (!form.date) e.date = 'Tanggal wajib diisi'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setErrors((p) => ({ ...p, receipt: 'File harus berupa gambar' })); return }
    if (file.size > 5 * 1024 * 1024) { setErrors((p) => ({ ...p, receipt: 'Ukuran file maks. 5MB' })); return }
    setErrors((p) => ({ ...p, receipt: null }))
    setReceiptFile(file)
    setReceiptPreview(URL.createObjectURL(file))
  }

  const handleRemoveReceipt = () => {
    setReceiptFile(null)
    setReceiptPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ve = validate()
    if (Object.keys(ve).length > 0) { setErrors(ve); return }
    setLoading(true)
    await onSubmit({
      title: form.title.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      note: form.note.trim(),
      receipt_url: receiptPreview && !receiptFile ? receiptPreview : (receiptFile ? undefined : null),
    }, receiptFile)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Sumber Pemasukan
        </label>
        <input type="text" name="title" value={form.title} onChange={handleChange}
          placeholder="Contoh: Gaji bulan ini, Proyek freelance"
          className={`input-field ${errors.title ? 'ring-2 ring-red-500/50' : ''}`} />
        {errors.title && <p className="text-xs text-red-400 mt-1.5">{errors.title}</p>}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Nominal
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">Rp</span>
          <input type="number" name="amount" value={form.amount} onChange={handleChange}
            placeholder="0" min="1"
            className={`input-field pl-12 text-lg font-bold ${errors.amount ? 'ring-2 ring-red-500/50' : ''}`} />
        </div>
        {errors.amount && <p className="text-xs text-red-400 mt-1.5">{errors.amount}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Kategori
        </label>
        <div className="grid grid-cols-3 gap-2">
          {INCOME_CATEGORIES.map((cat) => (
            <button key={cat.id} type="button"
              onClick={() => setForm((p) => ({ ...p, category: cat.id }))}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${
                form.category === cat.id
                  ? 'border-emerald-500/60 bg-emerald-500/20 scale-105'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}>
              <span className="text-xl">{cat.icon}</span>
              <span className="text-xs text-gray-300 leading-tight text-center line-clamp-1">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Tanggal
        </label>
        <input type="date" name="date" value={form.date} onChange={handleChange}
          className={`input-field ${errors.date ? 'ring-2 ring-red-500/50' : ''}`} />
        {errors.date && <p className="text-xs text-red-400 mt-1.5">{errors.date}</p>}
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Catatan <span className="text-gray-600 normal-case font-normal">(opsional)</span>
        </label>
        <textarea name="note" value={form.note} onChange={handleChange}
          placeholder="Tambahkan catatan..." rows={2} className="input-field resize-none" />
      </div>

      {/* Receipt Upload */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Foto Bukti <span className="text-gray-600 normal-case font-normal">(opsional)</span>
        </label>

        {receiptPreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">
            <img src={receiptPreview} alt="Preview" className="w-full max-h-44 object-contain" />
            <button type="button" onClick={handleRemoveReceipt}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="text-xs text-white/70 truncate">
                {receiptFile ? receiptFile.name : 'Bukti tersimpan'}
              </p>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-white/15 rounded-2xl p-8 text-center hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group">
            <div className="w-12 h-12 bg-white/5 group-hover:bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors">
              <Camera className="w-6 h-6 text-gray-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-sm text-gray-400 group-hover:text-gray-300">Unggah foto bukti transfer</p>
            <p className="text-xs text-gray-600 mt-1">JPG, PNG, WEBP · Maks. 5MB</p>
          </button>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        {errors.receipt && <p className="text-xs text-red-400 mt-1.5">{errors.receipt}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">Batal</button>
        )}
        <button type="submit" disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 h-12 text-base font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 active:scale-95 shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
            : initialData ? 'Simpan Perubahan' : 'Tambah Pemasukan'
          }
        </button>
      </div>
    </form>
  )
}
