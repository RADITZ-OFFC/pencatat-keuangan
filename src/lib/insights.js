import { getCategoryById, formatCurrency } from './constants'

/**
 * Generate spending insight messages based on expense data
 */
export function generateInsights(currentExpenses, prevExpenses, budgets = {}) {
  const insights = []

  if (!currentExpenses.length) return insights

  const total = currentExpenses.reduce((s, e) => s + e.amount, 0)
  const prevTotal = prevExpenses.reduce((s, e) => s + e.amount, 0)

  // Category map current
  const catMap = {}
  currentExpenses.forEach((e) => {
    catMap[e.category] = (catMap[e.category] || 0) + e.amount
  })

  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1])
  const topCat = sorted[0]

  // 1. Top spending category
  if (topCat) {
    const cat = getCategoryById(topCat[0])
    const pct = ((topCat[1] / total) * 100).toFixed(0)
    insights.push({
      type: 'info',
      icon: cat.icon,
      text: `Pengeluaran terbesar kamu di ${cat.label} (${pct}% dari total)`,
    })
  }

  // 2. Compare with last month
  if (prevTotal > 0) {
    const diff = total - prevTotal
    const diffPct = Math.abs((diff / prevTotal) * 100).toFixed(0)
    if (diff > 0) {
      insights.push({
        type: 'warning',
        icon: '📈',
        text: `Pengeluaran naik ${diffPct}% dibanding bulan lalu`,
      })
    } else if (diff < 0) {
      insights.push({
        type: 'success',
        icon: '📉',
        text: `Pengeluaran turun ${diffPct}% dibanding bulan lalu — bagus!`,
      })
    }
  }

  // 3. Budget warnings
  Object.entries(budgets).forEach(([catId, limit]) => {
    if (!limit) return
    const spent = catMap[catId] || 0
    const pct = (spent / limit) * 100
    const cat = getCategoryById(catId)
    if (pct >= 100) {
      insights.push({
        type: 'danger',
        icon: '🚨',
        text: `Budget ${cat.label} sudah habis! (${formatCurrency(spent)} / ${formatCurrency(limit)})`,
      })
    } else if (pct >= 80) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        text: `Budget ${cat.label} hampir habis — tersisa ${formatCurrency(limit - spent)}`,
      })
    }
  })

  // 4. Frequency insight
  const days = [...new Set(currentExpenses.map((e) => e.date))].length
  if (days > 0) {
    const avgPerDay = total / days
    if (avgPerDay > 200000) {
      insights.push({
        type: 'warning',
        icon: '💸',
        text: `Rata-rata ${formatCurrency(avgPerDay)}/hari di bulan ini`,
      })
    }
  }

  // 5. Most frequent category
  const freqMap = {}
  currentExpenses.forEach((e) => { freqMap[e.category] = (freqMap[e.category] || 0) + 1 })
  const freqSorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1])
  if (freqSorted.length > 0 && freqSorted[0][1] >= 3) {
    const cat = getCategoryById(freqSorted[0][0])
    insights.push({
      type: 'info',
      icon: '🔁',
      text: `Kamu sudah ${freqSorted[0][1]}x transaksi di ${cat.label} bulan ini`,
    })
  }

  return insights.slice(0, 4) // max 4 insights
}
