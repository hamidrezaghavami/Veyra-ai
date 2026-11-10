import { useEffect } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

export function AtmosphericBackground() {
  const reducedMotion = useReducedMotion()
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const visibility = useMotionValue(0)
  const opacity = useSpring(visibility, { stiffness: 80, damping: 25 })

  useEffect(() => {
    if (reducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      pointerX.set(event.clientX)
      pointerY.set(event.clientY)
      visibility.set(1)
    }
    const hide = () => visibility.set(0)
    const leave = (event: PointerEvent) => { if (event.relatedTarget === null) hide() }
    const hideWhenInactive = () => { if (document.hidden) hide() }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerout', leave, { passive: true })
    window.addEventListener('blur', hide)
    window.addEventListener('keydown', hide)
    document.addEventListener('visibilitychange', hideWhenInactive)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerout', leave)
      window.removeEventListener('blur', hide)
      window.removeEventListener('keydown', hide)
      document.removeEventListener('visibilitychange', hideWhenInactive)
    }
  }, [pointerX, pointerY, visibility, reducedMotion])

  return <div className="site-atmosphere" aria-hidden="true">
    <div className="site-atmosphere-wash" />
    {!reducedMotion && <motion.div className="site-cursor-glow" style={{ x: pointerX, y: pointerY, opacity }} />}
    <div className="site-atmosphere-texture" />
    <div className="site-atmosphere-horizon" />
  </div>
}
