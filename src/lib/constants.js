export const CATEGORIES = [
  { id: 'makanan',      label: 'Makanan',    icon: '🍜', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  { id: 'transportasi', label: 'Transport',  icon: '🚗', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { id: 'hobi',         label: 'Hobi',       icon: '🎮', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { id: 'belanja',      label: 'Belanja',    icon: '🛍️', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  { id: 'kesehatan',    label: 'Kesehatan',  icon: '💊', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { id: 'pendidikan',   label: 'Pendidikan', icon: '📚', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  { id: 'tagihan',      label: 'Tagihan',    icon: '💡', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  { id: 'lainnya',      label: 'Lainnya',    icon: '📦', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
]

export const INCOME_CATEGORIES = [
  { id: 'gaji',       label: 'Gaji',        icon: '💼', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { id: 'freelance',  label: 'Freelance',   icon: '💻', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { id: 'bisnis',     label: 'Bisnis',      icon: '🏪', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  { id: 'investasi',  label: 'Investasi',   icon: '📈', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { id: 'hadiah',     label: 'Hadiah',      icon: '🎁', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  { id: 'lainnya_in', label: 'Lainnya',     icon: '💰', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
]

export const CATEGORY_GRADIENTS = {
  makanan:      'from-orange-500 to-amber-500',
  transportasi: 'from-blue-500 to-cyan-500',
  hobi:         'from-purple-500 to-violet-500',
  belanja:      'from-pink-500 to-rose-500',
  kesehatan:    'from-emerald-500 to-teal-500',
  pendidikan:   'from-yellow-500 to-orange-400',
  tagihan:      'from-red-500 to-rose-600',
  lainnya:      'from-gray-500 to-slate-500',
}

export const INCOME_GRADIENTS = {
  gaji:       'from-emerald-500 to-teal-500',
  freelance:  'from-blue-500 to-cyan-500',
  bisnis:     'from-violet-500 to-purple-500',
  investasi:  'from-amber-500 to-yellow-500',
  hadiah:     'from-pink-500 to-rose-500',
  lainnya_in: 'from-gray-500 to-slate-500',
}

export const getCategoryById = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1]

export const getIncomeCategoryById = (id) =>
  INCOME_CATEGORIES.find((c) => c.id === id) || INCOME_CATEGORIES[INCOME_CATEGORIES.length - 1]

export const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export const formatDateShort = (dateStr) => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}
