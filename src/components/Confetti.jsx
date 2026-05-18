import React, { useEffect, useRef } from 'react'

const COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#fb923c']

function randomBetween(a, b) {
  return a + Math.random() * (b - a)
}

export default function Confetti({ active, onDone }) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafRef = useRef(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Spawn particles
    particlesRef.current = Array.from({ length: 80 }, () => ({
      x: randomBetween(canvas.width * 0.2, canvas.width * 0.8),
      y: randomBetween(-20, -80),
      vx: randomBetween(-3, 3),
      vy: randomBetween(2, 6),
      size: randomBetween(6, 12),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: randomBetween(0, Math.PI * 2),
      rotSpeed: randomBetween(-0.1, 0.1),
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      alpha: 1,
    }))

    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      particlesRef.current.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.12 // gravity
        p.rotation += p.rotSpeed
        if (frame > 60) p.alpha -= 0.015

        ctx.save()
        ctx.globalAlpha = Math.max(p.alpha, 0)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      })

      const alive = particlesRef.current.some((p) => p.alpha > 0 && p.y < canvas.height)
      if (alive) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        onDone?.()
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}
