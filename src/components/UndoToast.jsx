import React, { useEffect, useState, useCallback } from 'react'
import { RotateCcw, X } from 'lucide-react'

/**
 * Usage:
 *   const { showUndo, UndoToast } = useUndoToast()
 *   showUndo('Pengeluaran dihapus', () => restoreFn())
 *   return <UndoToast />
 */
export function useUndoToast() {
  const [toast, setToast] = useState(null) // { message, onUndo, id }
  const [visible, setVisible] = useState(false)
  const timerRef = React.useRef(null)

  const dismiss = useCallback(() => {
    setVisible(false)
    setTimeout(() => setToast(null), 300)
  }, [])

  const showUndo = useCallback((message, onUndo, duration = 4500) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ message, onUndo, id: Date.now() })
    // Small delay so animation triggers
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    timerRef.current = setTimeout(dismiss, duration)
  }, [dismiss])

  const handleUndo = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    toast?.onUndo?.()
    dismiss()
    // Haptic
    if (navigator.vibrate) navigator.vibrate(30)
  }, [toast, dismiss])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const ToastComponent = toast ? (
    <div
      className="fixed left-1/2 z-50 pointer-events-auto w-full max-w-sm px-4"
      style={{
        bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
        transform: `translateX(-50%) translateY(${visible ? '0' : '16px'})`,
        opacity: visible ? 1 : 0,
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
      }}
    >
      <div className="flex items-center gap-3 bg-[#1e1e2e] border border-white/15 rounded-2xl px-4 py-3 shadow-2xl shadow-black/50">
        <p className="text-sm text-gray-200 flex-1 truncate">{toast.message}</p>
        <button
          onClick={handleUndo}
          className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors px-2 py-1 rounded-lg hover:bg-violet-500/10 active:scale-95 flex-shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Undo
        </button>
        <button onClick={dismiss} className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  ) : null

  return { showUndo, UndoToast: ToastComponent }
}
