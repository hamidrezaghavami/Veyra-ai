import { useRouter, RouterProvider } from './context/RouterContext'
import { AtmosphericBackground } from './components/AtmosphericBackground'
import { HomePage } from './pages/HomePage'
import { WaitlistPage } from './pages/WaitlistPage'
import { ContactPage } from './pages/ContactPage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { OtpPage } from './pages/OtpPage'
import { DashboardPage } from './pages/DashboardPage'
import { BlogPage } from './pages/BlogPage'
import { BlogPostPage } from './pages/BlogPostPage'
import { ChangelogPage } from './pages/ChangelogPage'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'
import { TermsOfServicePage } from './pages/TermsOfServicePage'
import { DesignSystemPage } from './pages/DesignSystemPage'
import { ThanksPage } from './pages/ThanksPage'
import { NotFoundPage } from './pages/NotFoundPage'

function RouteSwitcher() {
  const { path } = useRouter()

  if (path === '/' || path === '') {
    return <HomePage />
  }

  if (path === '/waitlist') {
    return <WaitlistPage />
  }

  if (path === '/contact') {
    return <ContactPage />
  }

  if (path === '/sign-in') {
    return <SignInPage />
  }

  if (path === '/sign-up') {
    return <SignUpPage />
  }

  if (path === '/otp') {
    return <OtpPage />
  }

  if (path === '/account' || path === '/dashboard') {
    return <DashboardPage />
  }

  if (path === '/blog') {
    return <BlogPage />
  }

  if (path.startsWith('/blog/')) {
    const slug = path.replace('/blog/', '')
    return <BlogPostPage slug={slug} />
  }

  if (path === '/changelog') {
    return <ChangelogPage />
  }

  if (path === '/legal/privacy-policy') {
    return <PrivacyPolicyPage />
  }

  if (path === '/legal/terms-of-service') {
    return <TermsOfServicePage />
  }

  if (path === '/design-system') {
    return <DesignSystemPage />
  }

  if (path === '/thanks') {
    return <ThanksPage />
  }

  return <NotFoundPage />
}

export default function App() {
  return (
    <RouterProvider>
      <AtmosphericBackground />
      <RouteSwitcher />
    </RouterProvider>
  )
}
