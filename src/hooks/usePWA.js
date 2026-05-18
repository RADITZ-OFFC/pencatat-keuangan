import { useState, useEffect } from 'react'

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Capture install prompt
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setIsInstalled(true))

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const promptInstall = async () => {
    if (!installPrompt) return false
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setIsInstalled(true)
    setInstallPrompt(null)
    return outcome === 'accepted'
  }

  const requestNotifications = async () => {
    if (typeof Notification === 'undefined') return false
    const perm = await Notification.requestPermission()
    setNotifPermission(perm)
    return perm === 'granted'
  }

  const scheduleReminder = () => {
    if (notifPermission !== 'granted') return
    // Simple daily reminder via setTimeout (for demo — real app would use push server)
    const now = new Date()
    const target = new Date()
    target.setHours(20, 0, 0, 0) // 8 PM reminder
    if (target <= now) target.setDate(target.getDate() + 1)
    const delay = target - now

    setTimeout(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification('Pencatat Keuangan 💰', {
            body: 'Jangan lupa catat pengeluaran hari ini!',
            icon: '/icon-192.png',
            vibrate: [100, 50, 100],
          })
        })
      }
    }, delay)
  }

  return { installPrompt, isInstalled, promptInstall, notifPermission, requestNotifications, scheduleReminder }
}
