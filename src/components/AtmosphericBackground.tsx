import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function AtmosphericBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Fluid spring coordinates for primary spotlight orb
  const mouseX = useMotionValue(
    typeof window !== 'undefined' ? window.innerWidth * 0.5 : 600
  )
  const mouseY = useMotionValue(
    typeof window !== 'undefined' ? window.innerHeight * 0.35 : 350
  )

  const springX = useSpring(mouseX, { stiffness: 240, damping: 26 })
  const springY = useSpring(mouseY, { stiffness: 240, damping: 26 })

  // Trailing secondary orb for chromatic liquid parallax
  const trailX = useSpring(mouseX, { stiffness: 110, damping: 30 })
  const trailY = useSpring(mouseY, { stiffness: 110, damping: 30 })

  // Keep track of cursor state
  const [hasMoved, setHasMoved] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Initial center position
    mouseX.set(window.innerWidth * 0.5)
    mouseY.set(window.innerHeight * 0.35)

    const handleMouseMove = (e: MouseEvent) => {
      setHasMoved(true)
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setHasMoved(true)
        mouseX.set(e.touches[0].clientX)
        mouseY.set(e.touches[0].clientY)
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [mouseX, mouseY])

  // Interactive 60/120fps Canvas: Dynamic Constellation, Magnetic Grid & Kinetic Cursor Waves
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    // Cursor position smoothing for physics calculations
    const targetMouse = { x: width * 0.5, y: height * 0.35 }
    const currentMouse = { x: width * 0.5, y: height * 0.35 }
    let lastMoveTime = Date.now()

    const onPointerMove = (e: MouseEvent) => {
      targetMouse.x = e.clientX
      targetMouse.y = e.clientY
      lastMoveTime = Date.now()
    }
    window.addEventListener('mousemove', onPointerMove, { passive: true })

    // Spawn responsive interactive star/particle nodes
    const particleCount = Math.min(Math.floor((width * height) / 10000), 125)
    const particles: Array<{
      x: number
      y: number
      originX: number
      originY: number
      vx: number
      vy: number
      size: number
      baseAlpha: number
      color: string
      glowColor: string
      phase: number
    }> = []

    const colorPalette = [
      { fill: '#21d2ed', glow: '#00f0ff' }, // Neon cyan
      { fill: '#38bdf8', glow: '#0284c7' }, // Azure blue
      { fill: '#a855f7', glow: '#8b5cf6' }, // Electric purple
      { fill: '#6366f1', glow: '#4f46e5' }, // Deep indigo
      { fill: '#ffffff', glow: '#21d2ed' }, // Luminous white-cyan
    ]

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      particles.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 2.2 + 1.2,
        baseAlpha: Math.random() * 0.45 + 0.35,
        color: col.fill,
        glowColor: col.glow,
        phase: Math.random() * Math.PI * 2,
      })
    }

    // Interactive cursor spark trails
    const sparkTrails: Array<{
      x: number
      y: number
      vx: number
      vy: number
      alpha: number
      size: number
      color: string
    }> = []

    let prevX = currentMouse.x
    let prevY = currentMouse.y
    const cursorRadius = 260
    let frame = 0

    const render = () => {
      frame++
      // Smooth lerp towards pointer
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.12
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.12

      // Spawn subtle kinetic sparks on cursor motion
      const mouseSpeed = Math.hypot(currentMouse.x - prevX, currentMouse.y - prevY)
      if (mouseSpeed > 1.5 && sparkTrails.length < 35 && frame % 2 === 0) {
        sparkTrails.push({
          x: currentMouse.x + (Math.random() - 0.5) * 20,
          y: currentMouse.y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 1.2 - (currentMouse.x - prevX) * 0.08,
          vy: (Math.random() - 0.5) * 1.2 - (currentMouse.y - prevY) * 0.08,
          alpha: 0.85,
          size: Math.random() * 2.2 + 1.2,
          color: Math.random() > 0.4 ? '#21d2ed' : '#a855f7',
        })
      }
      prevX = currentMouse.x
      prevY = currentMouse.y

      ctx.clearRect(0, 0, width, height)

      // 1. Interactive Spotlight Matrix Grid (illuminates under cursor)
      const gridSize = 48
      const gridCols = Math.ceil(width / gridSize)
      const gridRows = Math.ceil(height / gridSize)

      for (let c = 0; c < gridCols; c++) {
        for (let r = 0; r < gridRows; r++) {
          const gx = c * gridSize
          const gy = r * gridSize
          const gDist = Math.hypot(currentMouse.x - gx, currentMouse.y - gy)

          if (gDist < 380) {
            const factor = Math.max(0, 1 - gDist / 380)
            const dotAlpha = factor * factor * 0.5
            const dotSize = 1.0 + factor * 1.8

            ctx.beginPath()
            ctx.arc(gx, gy, dotSize, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(33, 210, 237, ${dotAlpha})`
            ctx.fill()
          }
        }
      }

      // 2. Cursor Spotlight Beam Bloom (High Visibility Dynamic Glow)
      const spotGrad = ctx.createRadialGradient(
        currentMouse.x,
        currentMouse.y,
        0,
        currentMouse.x,
        currentMouse.y,
        420
      )
      spotGrad.addColorStop(0, 'rgba(33, 210, 237, 0.35)')
      spotGrad.addColorStop(0.22, 'rgba(14, 165, 233, 0.22)')
      spotGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.12)')
      spotGrad.addColorStop(0.8, 'rgba(99, 102, 241, 0.04)')
      spotGrad.addColorStop(1, 'rgba(7, 9, 14, 0)')

      ctx.fillStyle = spotGrad
      ctx.fillRect(0, 0, width, height)

      // 3. Render and update interactive constellation particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Drift motion
        p.x += p.vx
        p.y += p.vy
        p.phase += 0.02

        // Screen boundary wrapping
        if (p.x < -20) p.x = width + 20
        if (p.x > width + 20) p.x = -20
        if (p.y < -20) p.y = height + 20
        if (p.y > height + 20) p.y = -20

        // Distance to cursor
        const dx = currentMouse.x - p.x
        const dy = currentMouse.y - p.y
        const dist = Math.hypot(dx, dy)

        // Kinetic repulsion physics: particles scatter away when cursor sweeps past
        let extraAlpha = 0
        let scale = 1.0
        if (dist < cursorRadius && dist > 1) {
          const ratio = 1 - dist / cursorRadius
          const force = ratio * ratio * 3.8
          p.x -= (dx / dist) * force * 1.8
          p.y -= (dy / dist) * force * 1.8
          extraAlpha = ratio * 0.55
          scale = 1 + ratio * 1.4
        }

        // Draw particle node
        const alpha = Math.min(1, p.baseAlpha + extraAlpha + Math.sin(p.phase) * 0.12)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = alpha

        if (dist < cursorRadius) {
          ctx.shadowColor = p.glowColor
          ctx.shadowBlur = 14
        } else {
          ctx.shadowColor = p.glowColor
          ctx.shadowBlur = 4
        }
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1.0

        // Constellation filaments connecting neighbor nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const pdist = Math.hypot(p.x - p2.x, p.y - p2.y)
          if (pdist < 135) {
            const ratio = 1 - pdist / 135
            const nearCursor = dist < cursorRadius
            const lineAlpha = ratio * (nearCursor ? 0.55 : 0.22)

            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = p.color === '#a855f7' || p2.color === '#a855f7'
              ? `rgba(168, 85, 247, ${lineAlpha})`
              : `rgba(33, 210, 237, ${lineAlpha})`
            ctx.lineWidth = nearCursor ? 1.6 : 0.9
            ctx.stroke()
          }
        }
      }

      // 4. Render kinetic cursor spark trails
      for (let s = sparkTrails.length - 1; s >= 0; s--) {
        const spark = sparkTrails[s]
        spark.x += spark.vx
        spark.y += spark.vy
        spark.alpha -= 0.025
        spark.size *= 0.96

        if (spark.alpha <= 0.05) {
          sparkTrails.splice(s, 1)
          continue
        }

        ctx.beginPath()
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2)
        ctx.fillStyle = spark.color
        ctx.globalAlpha = spark.alpha
        ctx.shadowColor = spark.color
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1.0
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onPointerMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#07090e]"
      aria-hidden="true"
    >
      {/* 1. Primary Dynamic Electric Cyan Cursor Spotlight (VIVID & HIGH VISIBILITY) */}
      <motion.div
        style={{
          x: springX,
          y: springY,
        }}
        className="absolute top-0 left-0 w-[700px] h-[700px] -ml-[350px] -mt-[350px] rounded-full bg-gradient-to-tr from-[#21d2ed]/60 via-[#0284c7]/40 to-transparent blur-[75px] pointer-events-none"
      />

      {/* 2. Trailing Radiant Neon Violet Aurora (Chromatic Parallax Inertia) */}
      <motion.div
        style={{
          x: trailX,
          y: trailY,
        }}
        className="absolute top-0 left-0 w-[600px] h-[600px] -ml-[300px] -mt-[300px] rounded-full bg-gradient-to-br from-[#8b5cf6]/55 via-[#6366f1]/38 to-transparent blur-[85px] pointer-events-none"
      />

      {/* 3. Deep Atmospheric Corner Lighting (Rich Contrast Across Whole Viewport) */}
      <div className="absolute -top-[120px] left-1/2 -translate-x-1/2 w-[980px] h-[520px] bg-gradient-to-b from-[#21d2ed]/28 via-[#0284c7]/16 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[32%] -right-[160px] w-[700px] h-[700px] bg-gradient-to-tr from-[#6366f1]/26 via-[#a855f7]/18 to-transparent rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[8%] -left-[180px] w-[800px] h-[700px] bg-gradient-to-br from-[#21d2ed]/24 via-[#14b8a6]/16 to-transparent rounded-full blur-[110px] pointer-events-none" />

      {/* 4. Interactive 60fps Physics Canvas: Magnetic Grid, Constellation Nodes & Kinetic Wave */}
      <canvas ref={canvasRef} className="absolute inset-0 size-full pointer-events-none" />

      {/* 5. Spatial Micro-Dot Texture Grid */}
      <div className="absolute inset-0 subtle-grid opacity-60 pointer-events-none" />

      {/* 6. Top Specular Radiant Horizon Hairline */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#21d2ed]/80 to-transparent pointer-events-none shadow-[0_0_15px_#21d2ed]" />
    </div>
  )
}
