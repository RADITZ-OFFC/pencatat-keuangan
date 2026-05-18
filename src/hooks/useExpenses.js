import { useState, useEffect, useCallback } from 'react'
import { supabase, RECEIPT_BUCKET } from '../lib/supabase'

export function useExpenses(userId) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetchExpenses = useCallback(async (filters = {}) => {
    if (!userId) { setExpenses([]); setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)          // ← isolasi per user
        .order('date', { ascending: false })

      if (filters.category)  query = query.eq('category', filters.category)
      if (filters.startDate) query = query.gte('date', filters.startDate)
      if (filters.endDate)   query = query.lte('date', filters.endDate)

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      setExpenses(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  const addExpense = async (expenseData, receiptFile) => {
    if (!userId) return { data: null, error: 'Not authenticated' }
    try {
      let receiptUrl = null

      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop()
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from(RECEIPT_BUCKET)
          .upload(fileName, receiptFile, { cacheControl: '3600', upsert: false })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from(RECEIPT_BUCKET)
          .getPublicUrl(fileName)

        receiptUrl = urlData.publicUrl
      }

      const { data, error: insertError } = await supabase
        .from('expenses')
        .insert([{ ...expenseData, amount: Math.round(expenseData.amount), user_id: userId, receipt_url: receiptUrl }])
        .select()
        .single()

      if (insertError) throw insertError
      setExpenses((prev) => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const updateExpense = async (id, updates, newReceiptFile) => {
    if (!userId) return { data: null, error: 'Not authenticated' }
    try {
      let receiptUrl = updates.receipt_url

      if (newReceiptFile) {
        const fileExt = newReceiptFile.name.split('.').pop()
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from(RECEIPT_BUCKET)
          .upload(fileName, newReceiptFile, { cacheControl: '3600', upsert: false })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from(RECEIPT_BUCKET)
          .getPublicUrl(fileName)

        receiptUrl = urlData.publicUrl
      }

      const { data, error: updateError } = await supabase
        .from('expenses')
        .update({ ...updates, receipt_url: receiptUrl })
        .eq('id', id)
        .eq('user_id', userId)          // ← pastikan hanya bisa edit milik sendiri
        .select()
        .single()

      if (updateError) throw updateError
      setExpenses((prev) => prev.map((e) => (e.id === id ? data : e)))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const deleteExpense = async (id, receiptUrl) => {
    if (!userId) return { error: 'Not authenticated' }
    try {
      if (receiptUrl) {
        const path = receiptUrl.split(`/${RECEIPT_BUCKET}/`)[1]
        if (path) await supabase.storage.from(RECEIPT_BUCKET).remove([path])
      }

      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)          // ← pastikan hanya bisa hapus milik sendiri

      if (deleteError) throw deleteError
      setExpenses((prev) => prev.filter((e) => e.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  return { expenses, loading, error, fetchExpenses, addExpense, updateExpense, deleteExpense }
}
