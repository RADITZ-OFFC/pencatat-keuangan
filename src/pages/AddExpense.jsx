import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import ExpenseForm from '../components/ExpenseForm'

export default function AddExpense({ addExpense }) {
  const navigate = useNavigate()
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const handleSubmit = async (data, file) => {
    setErrorMsg(null)
    const { error } = await addExpense(data, file)
    if (error) {
      setErrorMsg(error)
    } else {
      setSuccess(true)
      setTimeout(() => { setSuccess(false); navigate('/') }, 1600)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center glow-green">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-white">Tersimpan!</p>
          <p className="text-sm text-gray-400 mt-1">Pengeluaran berhasil dicatat</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-white">Catat Pengeluaran</h1>
        <p className="text-sm text-gray-500 mt-1">Isi detail pengeluaran kamu</p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-2xl px-4 py-3">
          {errorMsg}
        </div>
      )}

      <div className="card">
        <ExpenseForm key={new Date().toISOString().split('T')[0]} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
