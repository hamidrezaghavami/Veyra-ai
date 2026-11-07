import { useState } from 'react'
import { Check, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from '../context/RouterContext'
import { LiquidButton } from './LiquidButton'

export function Pricing() {
  const { navigate } = useRouter()
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'user/mo',
      desc: 'For individuals exploring what automation can do.',
      popular: false,
      features: [
        '3 active agents',
        '500 runs per month',
        'Core integrations',
        'Run history',
        'Email support',
      ],
      buttonText: 'Get started',
    },
    {
      name: 'Pro',
      price: isYearly ? '$15' : '$19',
      period: 'user/mo',
      desc: 'For teams who need more output without more headcount.',
      popular: true,
      features: [
        'Unlimited agents',
        'Unlimited runs',
        '100+ integrations',
        'Advanced logic & branching',
        'Priority support',
      ],
      buttonText: 'Get started',
    },
    {
      name: 'Teams',
      price: isYearly ? '$23' : '$29',
      period: 'user/mo',
      desc: 'For growing teams who need a scalable workflow at speed.',
      popular: false,
      features: [
        'Everything in Pro',
        'Up to 15 members',
        'Shared workspaces',
        'Role-based access',
        'Dedicated support',
      ],
      buttonText: 'Get started',
    },
  ]

  return (
    <section id="pricing" className="py-24 sm:py-32 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="eyebrow-tag mb-3">
            <span>Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-[-0.04em] text-white leading-[1.05]">
            Find your plan. <br />
            <span className="text-neutral-500 font-normal">[Pricing to be confirmed].</span>
          </h2>

          {/* Liquid Glass Billing Switcher */}
          <div className="mt-8 inline-flex items-center justify-center p-1 rounded-full liquid-glass-secondary border-white/15">
            <button
              onClick={() => setIsYearly(false)}
              className={`text-[13.5px] px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                !isYearly ? 'bg-white text-black font-medium shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`text-[13.5px] px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                isYearly ? 'bg-white text-black font-medium shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Yearly</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#21d2ed]/20 text-[#21d2ed] font-semibold">
                20% off
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`surface-card p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative ${
                plan.popular
                  ? 'border-[#21d2ed]/50 shadow-[0_20px_50px_rgba(33,210,237,0.15)] bg-gradient-to-b from-[#141926] to-[#0e121a]'
                  : 'hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-5 right-5 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#21d2ed]/20 text-[#21d2ed] border border-[#21d2ed]/40">
                  POPULAR
                </div>
              )}

              <div>
                <div className="text-xl font-medium text-white mb-2">{plan.name}</div>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-4xl font-mono font-medium text-white">{plan.price}</span>
                  <span className="text-[13px] text-neutral-400">{plan.period}</span>
                </div>
                <p className="text-[14px] text-[#b0b0b0] leading-[1.4] mb-6 min-h-[40px]">
                  {plan.desc}
                </p>

                <div className="space-y-3 pt-6 border-t border-white/5 mb-8">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-[13px] text-[#b0b0b0]">
                      <Check className="size-4 text-[#21d2ed] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <LiquidButton
                variant={plan.popular ? 'primary' : 'secondary'}
                size="md"
                onClick={() => navigate('/account')}
                className="w-full"
                icon={<ArrowRight className="size-3.5" />}
              >
                {plan.buttonText}
              </LiquidButton>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-[12px] text-neutral-500 font-normal">
          [Sample plans and prices. Veyra AI pricing to be confirmed.]
        </p>
      </div>
    </section>
  )
}
