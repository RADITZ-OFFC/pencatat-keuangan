import React, { useState } from 'react'
import { Flame, X } from 'lucide-react'

function getStreakLabel(n) {
  if (n >= 30) return { label: 'Legenda 🏆', color: 'from-yellow-500 to-amber-400' }
  if (n >= 14) return { label: 'Konsisten 💪', color: 'from-violet-500 to-purple-400' }
  if (n >= 7)  return { label: 'Semangat! 🔥', color: 'from-orange-500 to-red-400' }
  if (n >= 3)  return { label: 'Bagus! ✨', color: 'from-blue-500 to-cyan-400' }
  return { label: 'Mulai streak!', color: 'from-gray-600 to-gray-500' }
}

export default function StreakBadge({ current, longest, recordedToday }) {
  const [showDetail, setShowDetail] = useState(false)
  const { label, color } = getStreakLabel(current)

  if (current === 0 && !recordedToday) return null

  return (
    <>
      <button
        onClick={() => setShowDetail(true)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r ${color} shadow-lg active:scale-95 transition-transform`}
      >
        <Flame className="w-4 h-4 text-white" fill="white" />
        <span className="text-white text-sm font-bold">{current}</span>
        <span className="text-white/80 text-xs">hari</span>
      </button>

      {showDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="bg-[#1a1a24] border border-white/10 rounded-3xl p-6 w-full max-w-xs text-center shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-4 shadow-xl`}>
              <Flame className="w-10 h-10 text-white" fill="white" />
            </div>

            <p className="text-3xl font-bold text-white mb-1">{current} Hari</p>
            <p className={`text-sm font-semibold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-4`}>
              {label}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
              <div className="glass rounded-xl p-3">
                <p className="text-2xl font-bold text-white">{current}</p>
                <p className="text-xs text-gray-500 mt-0.5">Streak saat ini</p>
              </div>
              <div className="glass rounded-xl p-3">
                <p className="text-2xl font-bold text-violet-400">{longest}</p>
                <p className="text-xs text-gray-500 mt-0.5">Terpanjang</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              {recordedToday
                ? '✅ Sudah catat hari ini!'
                : '⏰ Belum catat hari ini — jangan putus streak!'}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
