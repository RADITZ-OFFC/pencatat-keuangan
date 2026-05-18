import React, { useState, useRef } from 'react'
import { Upload, X, Loader2, Camera } from 'lucide-react'
import { CATEGORIES, CATEGORY_GRADIENTS } from '../lib/constants'

const getToday = () => {
  const d = new Date()
  // Pakai waktu lokal, bukan UTC
  const year  = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day   = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDefaultForm = () => ({
  title: '',
  amount: '',
  category: 'makanan',
  date: getToday(),
  note: '',
})

export default function ExpenseForm({ onSubmit, initialData = null, onCancel }) {
  const [form, setForm] = useState(
    initialData
      ? { title: initialData.title, amount: String(initialData.amount), category: initialData.category, date: initialData.date, note: initialData.note || '' }
      : getDefaultForm()
  )

  // Selalu update tanggal ke hari ini saat form pertama dibuka (bukan edit)
  React.useEffect(() => {
    if (!initialData) {
      setForm((prev) => ({ ...prev, date: getToday() }))
    }
  }, [])
  const [receiptFile, setReceiptFile] = useState(null)
  const [receiptPreview, setReceiptPreview] = useState(initialData?.receipt_url || null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef(null)

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
    const data = {
      title: form.title.trim(),
      amount: Math.round(Number(form.amount)),
      category: form.category,
      date: form.date,
      note: form.note.trim(),
      receipt_url: receiptPreview && !receiptFile ? receiptPreview : (receiptFile ? undefined : null),
    }
    await onSubmit(data, receiptFile)
    setLoading(false)
  }

  const selectedCat = CATEGORIES.find((c) => c.id === form.category)

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Judul Pengeluaran
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Contoh: Makan siang, Bensin, dll"
          className={`input-field ${errors.title ? 'ring-2 ring-red-500/50' : ''}`}
        />
        {errors.title && <p className="text-xs text-red-400 mt-1.5">{errors.title}</p>}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Nominal
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">Rp</span>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="0"
            min="1"
            className={`input-field pl-12 text-lg font-bold ${errors.amount ? 'ring-2 ring-red-500/50' : ''}`}
          />
        </div>
        {errors.amount && <p className="text-xs text-red-400 mt-1.5">{errors.amount}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Kategori
        </label>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setForm((p) => ({ ...p, category: cat.id }))}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 ${
                form.category === cat.id
                  ? 'border-violet-500/60 bg-violet-500/20 scale-105'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="text-xs text-gray-300 leading-tight text-center line-clamp-1 w-full">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Tanggal
        </label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className={`input-field ${errors.date ? 'ring-2 ring-red-500/50' : ''}`}
        />
        {errors.date && <p className="text-xs text-red-400 mt-1.5">{errors.date}</p>}
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Catatan <span className="text-gray-600 normal-case font-normal">(opsional)</span>
        </label>
        <textarea
          name="note"
          value={form.note}
          onChange={handleChange}
          placeholder="Tambahkan catatan..."
          rows={2}
          className="input-field resize-none"
        />
      </div>

      {/* Receipt Upload */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Foto Struk <span className="text-gray-600 normal-case font-normal">(opsional)</span>
        </label>

        {receiptPreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">
            <img src={receiptPreview} alt="Preview" className="w-full max-h-44 object-contain" />
            <button
              type="button"
              onClick={handleRemoveReceipt}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="text-xs text-white/70 truncate">
                {receiptFile ? receiptFile.name : 'Struk tersimpan'}
              </p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-white/15 rounded-2xl p-8 text-center hover:border-violet-500/50 hover:bg-violet-500/5 transition-all group"
          >
            <div className="w-12 h-12 bg-white/5 group-hover:bg-violet-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors">
              <Camera className="w-6 h-6 text-gray-500 group-hover:text-violet-400 transition-colors" />
            </div>
            <p className="text-sm text-gray-400 group-hover:text-gray-300">Unggah foto struk</p>
            <p className="text-xs text-gray-600 mt-1">JPG, PNG, WEBP · Maks. 5MB</p>
          </button>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        {errors.receipt && <p className="text-xs text-red-400 mt-1.5">{errors.receipt}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Batal
          </button>
        )}
        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
          ) : (
            initialData ? 'Simpan Perubahan' : 'Tambah Pengeluaran'
          )}
        </button>
      </div>
    </form>
  )
}
