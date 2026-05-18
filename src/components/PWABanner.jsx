import React, { useState } from 'react'
import { Download, Bell, X, Smartphone } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'

export default function PWABanner() {
  const { installPrompt, isInstalled, promptInstall, notifPermission, requestNotifications, scheduleReminder } = usePWA()
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('pwa_banner_dismissed') === 'true')
  const [notifDone, setNotifDone] = useState(notifPermission === 'granted')

  if (dismissed || isInstalled) return null
  if (!installPrompt && notifDone) return null

  const handleDismiss = () => {
    localStorage.setItem('pwa_banner_dismissed', 'true')
    setDismissed(true)
  }

  const handleInstall = async () => {
    await promptInstall()
  }

  const handleNotif = async () => {
    const granted = await requestNotifications()
    if (granted) {
      scheduleReminder()
      setNotifDone(true)
    }
  }

  return (
    <div className="card border border-violet-500/20 bg-violet-500/5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-violet-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-5 h-5 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Install Aplikasi</p>
          <p className="text-xs text-gray-400 mt-0.5">Akses lebih cepat seperti app native</p>
          <div className="flex gap-2 mt-3">
            {installPrompt && (
              <button onClick={handleInstall} className="flex items-center gap-1.5 text-xs bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg transition-colors active:scale-95">
                <Download className="w-3.5 h-3.5" /> Install
              </button>
            )}
            {!notifDone && notifPermission === 'default' && (
              <button onClick={handleNotif} className="flex items-center gap-1.5 text-xs glass text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors active:scale-95">
                <Bell className="w-3.5 h-3.5" /> Aktifkan Reminder
              </button>
            )}
          </div>
        </div>
        <button onClick={handleDismiss} className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
