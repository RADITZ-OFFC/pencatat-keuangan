import React, { useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { haptic } from '../lib/haptic'

const SWIPE_THRESHOLD = 80
const DELETE_THRESHOLD = 160

export default function SwipeableCard({ onDelete, children }) {
  const [offsetX, setOffsetX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const startXRef = useRef(null)
  const currentXRef = useRef(0)
  const hapticFiredRef = useRef(false)

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX
    setSwiping(true)
    hapticFiredRef.current = false
  }

  const handleTouchMove = (e) => {
    if (startXRef.current === null) return
    const dx = e.touches[0].clientX - startXRef.current
    if (dx > 0) { setOffsetX(0); return }
    currentXRef.current = dx
    const clamped = Math.max(dx, -DELETE_THRESHOLD - 20)
    setOffsetX(clamped)

    // Haptic at threshold
    if (clamped <= -DELETE_THRESHOLD && !hapticFiredRef.current) {
      haptic.swipeDelete()
      hapticFiredRef.current = true
    }
  }

  const handleTouchEnd = () => {
    setSwiping(false)
    const dx = currentXRef.current

    if (dx < -DELETE_THRESHOLD) {
      setDeleting(true)
      setOffsetX(-window.innerWidth)
      haptic.heavy()
      setTimeout(() => onDelete(), 300)
    } else if (dx < -SWIPE_THRESHOLD) {
      setOffsetX(-SWIPE_THRESHOLD)
    } else {
      setOffsetX(0)
    }
    startXRef.current = null
    currentXRef.current = 0
  }

  const isFullSwipe = offsetX < -DELETE_THRESHOLD

  return (
    <div className="relative overflow-hidden rounded-2xl" onClick={offsetX < -10 ? () => setOffsetX(0) : undefined}>
      {/* Delete background */}
      <div className={`absolute inset-0 flex items-center justify-end pr-5 rounded-2xl transition-colors ${isFullSwipe ? 'bg-red-500' : 'bg-red-500/80'}`}>
        <div className="flex flex-col items-center gap-1">
          <Trash2 className="w-5 h-5 text-white" />
          <span className="text-white text-xs font-medium">{isFullSwipe ? 'Lepas!' : 'Hapus'}</span>
        </div>
      </div>

      {/* Card — solid background to cover delete layer */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: swiping ? 'none' : 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
          opacity: deleting ? 0 : 1,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  )
}
