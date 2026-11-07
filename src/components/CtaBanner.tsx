import { ArrowRight } from 'lucide-react'
import { useRouter } from '../context/RouterContext'
import { ShaderBackground } from './ShaderBackground'
import { LiquidButton } from './LiquidButton'

export function CtaBanner() {
  const { navigate } = useRouter()

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="surface-card p-8 sm:p-16 text-center relative overflow-hidden border border-white/15 shadow-[0_30px_80px_rgba(0,0,0,0.8)]">
          {/* Internal Animated Shader */}
          <ShaderBackground
            variant="Large1"
            className="absolute inset-0 size-full -z-10 opacity-70"
            intensity={1.2}
          />

          <div className="max-w-2xl mx-auto relative z-10">
            <div className="eyebrow-tag mb-4 justify-center">
              <span>Get started</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-medium tracking-[-0.04em] text-white leading-[1.05] mb-5">
              Less invoice admin. <br />
              More financial control.
            </h2>

            <p className="text-base sm:text-lg text-[#b0b0b0] leading-[1.5] mb-9 font-normal">
              Process documents, review flagged issues, and understand your expenses with Veyra AI. You stay in charge.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <LiquidButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/sign-up')}
                className="w-full sm:w-auto"
                icon={<ArrowRight className="size-4" />}
              >
                Try Veyra AI Free
              </LiquidButton>

              <LiquidButton
                variant="secondary"
                size="lg"
                onClick={() => navigate('/waitlist')}
                className="w-full sm:w-auto"
              >
                Join the Waitlist
              </LiquidButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
