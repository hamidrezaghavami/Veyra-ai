import React, { useEffect, useRef } from 'react'

interface ShaderBackgroundProps {
  variant?: 'Small1' | 'Small2' | 'Small3' | 'Large1' | 'Large2' | 'Large3'
  className?: string
  intensity?: number
}

export function ShaderBackground({
  variant = 'Small1',
  className = '',
  intensity = 1.0,
}: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    // Set canvas dimensions
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * Math.min(window.devicePixelRatio, 2)
      canvas.height = rect.height * Math.min(window.devicePixelRatio, 2)
    }

    resize()
    window.addEventListener('resize', resize)

    // Variant color & phase configurations
    const configs = {
      Small1: { hue: 185, speed: 0.0006, waves: 3, cyanBias: 0.8 },
      Small2: { hue: 195, speed: 0.0008, waves: 4, cyanBias: 0.6 },
      Small3: { hue: 175, speed: 0.0005, waves: 3, cyanBias: 0.9 },
      Large1: { hue: 188, speed: 0.0004, waves: 5, cyanBias: 0.85 },
      Large2: { hue: 200, speed: 0.0005, waves: 4, cyanBias: 0.7 },
      Large3: { hue: 180, speed: 0.0006, waves: 5, cyanBias: 0.8 },
    }

    const cfg = configs[variant] || configs.Small1

    const render = () => {
      time += cfg.speed
      const w = canvas.width
      const h = canvas.height

      // Clear with dark base
      ctx.fillStyle = '#0e0f13'
      ctx.fillRect(0, 0, w, h)

      // Ambient radial gradient
      const grad = ctx.createRadialGradient(
        w * 0.5 + Math.sin(time * 2) * w * 0.15,
        h * 0.4 + Math.cos(time * 1.5) * h * 0.15,
        0,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.8
      )

      grad.addColorStop(0, `rgba(33, 210, 237, ${0.14 * intensity})`)
      grad.addColorStop(0.35, `rgba(20, 110, 140, ${0.08 * intensity})`)
      grad.addColorStop(0.7, `rgba(15, 23, 42, ${0.05 * intensity})`)
      grad.addColorStop(1, 'rgba(13, 13, 15, 0)')

      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // Fluid mesh wave lines
      ctx.lineWidth = 1.2
      for (let i = 0; i < cfg.waves; i++) {
        ctx.beginPath()
        const yOffset = (h / (cfg.waves + 1)) * (i + 1)
        const alpha = (0.08 + (i % 2) * 0.06) * intensity
        ctx.strokeStyle = `rgba(33, 210, 237, ${alpha})`

        for (let x = 0; x <= w; x += 15) {
          const angle = (x / w) * Math.PI * 2.5 + time * 3 + i * 1.2
          const y = yOffset + Math.sin(angle) * 22 * Math.sin(time + i)
          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [variant, intensity])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />
      {/* Subtle fine vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent opacity-80 pointer-events-none" />
    </div>
  )
}
