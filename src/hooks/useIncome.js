import { useState, useEffect, useCallback } from 'react'
import { supabase, RECEIPT_BUCKET } from '../lib/supabase'

export function useIncome(userId) {
  const [incomes, setIncomes]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetchIncomes = useCallback(async (filters = {}) => {
    if (!userId) { setIncomes([]); setLoading(false); return }
    setLoading(true); setError(null)
    try {
      let query = supabase
        .from('incomes')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (filters.startDate) query = query.gte('date', filters.startDate)
      if (filters.endDate)   query = query.lte('date', filters.endDate)

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      setIncomes(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchIncomes() }, [fetchIncomes])

  const addIncome = async (incomeData, receiptFile) => {
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
        .from('incomes')
        .insert([{ ...incomeData, amount: Math.round(incomeData.amount), user_id: userId, receipt_url: receiptUrl }])
        .select()
        .single()

      if (insertError) throw insertError
      setIncomes((prev) => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const updateIncome = async (id, updates, newReceiptFile) => {
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
        .from('incomes')
        .update({ ...updates, amount: Math.round(Number(updates.amount)), receipt_url: receiptUrl })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (updateError) throw updateError
      setIncomes((prev) => prev.map((i) => (i.id === id ? data : i)))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const deleteIncome = async (id, receiptUrl) => {
    if (!userId) return { error: 'Not authenticated' }
    try {
      // Hapus receipt dari storage jika ada
      if (receiptUrl) {
        const path = receiptUrl.split(`/${RECEIPT_BUCKET}/`)[1]
        if (path) await supabase.storage.from(RECEIPT_BUCKET).remove([path])
      }

      const { error: deleteError } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (deleteError) throw deleteError
      setIncomes((prev) => prev.filter((i) => i.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  return { incomes, loading, error, fetchIncomes, addIncome, updateIncome, deleteIncome }
}
