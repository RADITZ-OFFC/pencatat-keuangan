import { useMemo } from 'react'

/**
 * Calculate recording streak from expense dates
 * A streak = consecutive days where at least 1 expense was recorded
 */
export function useStreak(expenses) {
  return useMemo(() => {
    if (!expenses.length) return { current: 0, longest: 0, recordedToday: false }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Unique dates sorted descending
    const dates = [...new Set(expenses.map((e) => e.date))]
      .map((d) => { const dt = new Date(d); dt.setHours(0,0,0,0); return dt })
      .sort((a, b) => b - a)

    // Use local date string to avoid UTC timezone mismatch
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
    const recordedToday = expenses.some((e) => e.date === todayStr)

    // Current streak — count back from today or yesterday
    let current = 0
    let check = new Date(today)
    // If not recorded today, start from yesterday
    if (!recordedToday) check.setDate(check.getDate() - 1)

    for (let i = 0; i < dates.length; i++) {
      const d = dates[i]
      if (d.getTime() === check.getTime()) {
        current++
        check.setDate(check.getDate() - 1)
      } else if (d < check) {
        break
      }
    }

    // Longest streak
    let longest = 0
    let run = 1
    for (let i = 0; i < dates.length - 1; i++) {
      const diff = (dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        run++
        longest = Math.max(longest, run)
      } else {
        run = 1
      }
    }
    longest = Math.max(longest, current, 1)

    return { current, longest, recordedToday }
  }, [expenses])
}
