import { motion } from 'framer-motion'

export function Logos() {
  const logos = [
    { name: 'Corebit', symbol: '◈' },
    { name: 'Lumen Labs', symbol: '✦' },
    { name: 'Aerix', symbol: '▲' },
    { name: 'Driftwave', symbol: '≋' },
    { name: 'Novafund', symbol: '❖' },
    { name: 'Synthetix', symbol: '⬡' },
    { name: 'Krypton Data', symbol: '◬' },
    { name: 'Apex Ledger', symbol: '⬢' },
  ]

  // Double list for seamless loop
  const list = [...logos, ...logos, ...logos]

  return (
    <div className="py-12 border-y border-white/[0.06] bg-[#080a0f]/60 overflow-hidden relative">
      {/* Edge gradient fog */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#080a0f] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#080a0f] to-transparent z-10 pointer-events-none" />

      <p className="text-center text-[12px] uppercase tracking-wider text-neutral-400 mb-6">
        Trusted by modern finance teams and high-growth operators
      </p>

      <div className="flex overflow-hidden">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 28,
              ease: 'linear',
            },
          }}
          className="flex items-center gap-14 sm:gap-20 shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          {list.map((logo, idx) => (
            <div key={`${logo.name}-${idx}`} className="flex items-center gap-2.5 text-neutral-300 font-sans shrink-0 select-none">
              <span className="text-[#21d2ed] text-lg">{logo.symbol}</span>
              <span className="font-medium text-[17px] tracking-tight text-white">{logo.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
