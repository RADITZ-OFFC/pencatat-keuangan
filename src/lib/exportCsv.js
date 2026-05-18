import { getCategoryById, formatCurrency } from './constants'

/**
 * Export expenses array to a CSV file download
 */
export function exportToCsv(expenses, filename = 'pengeluaran.csv') {
  if (!expenses.length) return

  const headers = ['Tanggal', 'Judul', 'Kategori', 'Nominal', 'Catatan', 'Struk']
  const rows = expenses.map((e) => {
    const cat = getCategoryById(e.category)
    return [
      e.date,
      `"${e.title.replace(/"/g, '""')}"`,
      cat.label,
      e.amount,
      `"${(e.note || '').replace(/"/g, '""')}"`,
      e.receipt_url ? 'Ada' : 'Tidak',
    ]
  })

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Generate a summary CSV per category for a given month
 */
export function exportMonthlySummary(expenses, month, year) {
  const monthly = expenses.filter((e) => {
    const d = new Date(e.date)
    return d.getMonth() === month && d.getFullYear() === year
  })

  const map = {}
  monthly.forEach((e) => {
    if (!map[e.category]) map[e.category] = { total: 0, count: 0 }
    map[e.category].total += e.amount
    map[e.category].count += 1
  })

  const headers = ['Kategori', 'Jumlah Transaksi', 'Total']
  const rows = Object.entries(map).map(([id, { total, count }]) => {
    const cat = getCategoryById(id)
    return [cat.label, count, total]
  })

  const grandTotal = monthly.reduce((s, e) => s + e.amount, 0)
  rows.push(['TOTAL', monthly.length, grandTotal])

  const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
  const csvContent = [
    `Ringkasan Pengeluaran - ${MONTHS[month]} ${year}`,
    '',
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ringkasan-${MONTHS[month].toLowerCase()}-${year}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
