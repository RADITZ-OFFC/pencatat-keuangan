import { useState, useEffect } from 'react'

const STORAGE_KEY = 'pencatat_budgets'

export function useBudget() {
  const [budgets, setBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets))
  }, [budgets])

  const setBudget = (categoryId, amount) => {
    setBudgets((prev) => ({
      ...prev,
      [categoryId]: Number(amount),
    }))
  }

  const removeBudget = (categoryId) => {
    setBudgets((prev) => {
      const next = { ...prev }
      delete next[categoryId]
      return next
    })
  }

  const getBudget = (categoryId) => budgets[categoryId] || 0

  return { budgets, setBudget, removeBudget, getBudget }
}
