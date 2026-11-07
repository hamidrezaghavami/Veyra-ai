import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

export interface LiquidButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export function LiquidButton({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  disabled,
  ...props
}: LiquidButtonProps) {
  const sizeClasses = {
    sm: 'text-[13px] py-1.5 px-3.5 gap-1.5',
    md: 'text-[14px] py-2 px-5 gap-2',
    lg: 'text-[15px] py-2.5 px-6 gap-2.5',
  }

  const variantClasses = {
    primary: 'liquid-glass-primary text-[#09090b] font-medium',
    secondary: 'liquid-glass-secondary text-white font-medium hover:border-white/30',
    accent: 'liquid-glass-accent text-[#080a0f] font-semibold',
    ghost: 'bg-white/5 hover:bg-white/10 text-[#b0b0b0] hover:text-white border border-transparent hover:border-white/10',
  }

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.97, y: 0 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      disabled={disabled}
      className={`relative group overflow-hidden rounded-full inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {/* Top Specular Edge Highlight */}
      <span className="absolute top-0 inset-x-3 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" />

      {/* Liquid Specular Light Sheen sweep on hover */}
      <span className="absolute inset-0 -translate-x-[120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-1.5">
        {children}
        {icon && <span className="transition-transform group-hover:translate-x-0.5">{icon}</span>}
      </span>
    </motion.button>
  )
}
