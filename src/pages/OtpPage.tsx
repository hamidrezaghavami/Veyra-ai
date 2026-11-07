import { useState, useRef, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { LiquidButton } from '../components/LiquidButton'
import { authService } from '../services/authService'
import { useRouter } from '../context/RouterContext'

export function OtpPage() {
  const { navigate } = useRouter()
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [resendTimer, setResendTimer] = useState(30)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const pendingEmail = authService.getPendingEmail()
    if (pendingEmail) {
      setEmail(pendingEmail)
    } else {
      setEmail('kadir@veyra.ai')
    }

    inputRefs.current[0]?.focus()

    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('')
      const next = [...digits]
      pasted.forEach((char, i) => {
        if (i < 6) next[i] = char
      })
      setDigits(next)
      if (pasted.length === 6) {
        verify(next.join(''))
      }
      return
    }

    const next = [...digits]
    next[index] = value
    setDigits(next)
    setError('')

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (next.every((d) => d.length === 1)) {
      verify(next.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const verify = (codeString: string) => {
    const res = authService.verifyOtp(codeString)
    if (res.success) {
      navigate('/account')
    } else {
      setError(res.error || 'Invalid code. Use the code from email or 123456.')
    }
  }

  const handleResend = () => {
    if (resendTimer > 0) return
    authService.requestOtp(email)
    setResendTimer(30)
    setError('')
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-between relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-32 pb-24 px-4 sm:px-6 relative z-10">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-white mb-2">
              Enter code
            </h1>
            <p className="text-[14px] text-[#b0b0b0]">
              Enter the code we sent to <span className="text-white">{email}</span> to continue.
            </p>
          </div>

          <div className="surface-card p-6 sm:p-8 border border-white/15 shadow-2xl">
            <div className="flex justify-between gap-2 mb-6">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="size-12 text-center text-xl font-mono font-medium bg-[#141824]/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#21d2ed] transition-colors"
                />
              ))}
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[12px] text-center mb-4">
                {error}
              </div>
            )}

            <LiquidButton
              variant="primary"
              size="lg"
              onClick={() => verify(digits.join(''))}
              className="w-full"
              icon={<ArrowRight className="size-4" />}
            >
              Verify & Continue
            </LiquidButton>

            <div className="mt-5 text-center">
              <button
                onClick={handleResend}
                disabled={resendTimer > 0}
                className="text-[13px] text-neutral-400 hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
              >
                {resendTimer > 0 ? `Request new code in ${resendTimer}s` : 'Request new code'}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-[12px] text-neutral-500">
            Powered by FrameAuth
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
