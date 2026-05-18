import React, { useState } from 'react'
import { Wallet, Target, BarChart2, Camera, ArrowRight, Check } from 'lucide-react'

const slides = [
  {
    icon: Wallet,
    gradient: 'from-violet-600 to-blue-600',
    title: 'Catat Pengeluaran\ndengan Mudah',
    desc: 'Pantau setiap pengeluaran harian kamu — dari makan siang sampai tagihan bulanan.',
    color: 'text-violet-400',
  },
  {
    icon: Target,
    gradient: 'from-emerald-600 to-teal-600',
    title: 'Set Budget\nper Kategori',
    desc: 'Tentukan batas pengeluaran tiap kategori dan dapat peringatan sebelum over budget.',
    color: 'text-emerald-400',
  },
  {
    icon: BarChart2,
    gradient: 'from-amber-500 to-orange-600',
    title: 'Lihat Ringkasan\nBulanan',
    desc: 'Grafik dan insight otomatis biar kamu tahu ke mana uang kamu pergi setiap bulan.',
    color: 'text-amber-400',
  },
  {
    icon: Camera,
    gradient: 'from-pink-600 to-rose-600',
    title: 'Simpan Foto\nStruk Belanja',
    desc: 'Upload foto struk langsung dari kamera atau galeri — tersimpan aman di cloud.',
    color: 'text-pink-400',
  },
]

export default function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0)
  const [exiting, setExiting] = useState(false)

  const goNext = () => {
    if (step < slides.length - 1) {
      setExiting(true)
      setTimeout(() => { setStep((s) => s + 1); setExiting(false) }, 200)
    } else {
      onFinish()
    }
  }

  const slide = slides[step]
  const Icon = slide.icon

  return (
    <div className="fixed inset-0 bg-[#0f0f13] z-50 flex flex-col items-center justify-between px-6 py-12">
      {/* Background blob */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br ${slide.gradient} opacity-10 rounded-full blur-3xl transition-all duration-700`} />

      {/* Skip */}
      <div className="w-full flex justify-end relative z-10">
        <button onClick={onFinish} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          Lewati
        </button>
      </div>

      {/* Content */}
      <div
        className="flex-1 flex flex-col items-center justify-center text-center relative z-10 max-w-sm"
        style={{
          opacity: exiting ? 0 : 1,
          transform: exiting ? 'translateY(12px)' : 'translateY(0)',
          transition: 'opacity 200ms ease, transform 200ms ease',
        }}
      >
        {/* Icon */}
        <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center mb-8 shadow-2xl`}
          style={{ boxShadow: `0 20px 60px rgba(0,0,0,0.5)` }}>
          <Icon className="w-12 h-12 text-white" strokeWidth={1.5} />
        </div>

        <h2 className="text-3xl font-bold text-white leading-tight whitespace-pre-line mb-4">
          {slide.title}
        </h2>
        <p className="text-gray-400 text-base leading-relaxed">{slide.desc}</p>
      </div>

      {/* Bottom */}
      <div className="w-full relative z-10 space-y-6 max-w-sm">
        {/* Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`rounded-full transition-all duration-300 ${
                i === step ? `w-6 h-2 bg-gradient-to-r ${slide.gradient}` : 'w-2 h-2 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={goNext}
          className={`w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 bg-gradient-to-r ${slide.gradient} shadow-xl active:scale-95 transition-transform`}
        >
          {step === slides.length - 1 ? (
            <><Check className="w-5 h-5" /> Mulai Sekarang</>
          ) : (
            <>Lanjut <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </div>
    </div>
  )
}
