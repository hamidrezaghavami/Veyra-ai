import { ArrowLeft } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { LiquidButton } from '../components/LiquidButton'
import { useRouter } from '../context/RouterContext'

export function NotFoundPage() {
  const { navigate } = useRouter()

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-between relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-32 pb-24 px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-md mx-auto surface-card p-8 border border-white/15 shadow-2xl">
          <div className="text-6xl font-mono font-medium text-[#21d2ed] mb-4">404</div>
          <h1 className="text-2xl font-medium text-white mb-3">Page not found</h1>
          <p className="text-[14px] text-[#b0b0b0] mb-8">
            The page you're looking for doesn't exist or has moved to another address.
          </p>
          <LiquidButton
            variant="primary"
            size="md"
            onClick={() => navigate('/')}
            icon={<ArrowLeft className="size-4" />}
          >
            Return to Home
          </LiquidButton>
        </div>
      </main>

      <Footer />
    </div>
  )
}
