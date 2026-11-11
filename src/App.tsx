import { useLanguage } from './context/LanguageContext'
import { useRouter, RouterProvider } from './context/RouterContext'
import { AtmosphericBackground } from './components/AtmosphericBackground'
import { HomePage } from './pages/HomePage'
import { ClerkAuthProvider } from './components/ClerkAuthProvider'
const WaitlistPage = lazy(() => import('./pages/WaitlistPage').then(module => ({ default: module.WaitlistPage })))
const ContactPage = lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })))
const SignInPage = lazy(() => import('./pages/SignInPage').then(module => ({ default: module.SignInPage })))
const SignUpPage = lazy(() => import('./pages/SignUpPage').then(module => ({ default: module.SignUpPage })))
import { lazy, Suspense } from 'react'
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })))
const BlogPage = lazy(() => import('./pages/BlogPage').then(module => ({ default: module.BlogPage })))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then(module => ({ default: module.BlogPostPage })))
const PricingPage = lazy(() => import('./pages/PricingPage').then(module => ({ default: module.PricingPage })))
const ChangelogPage = lazy(() => import('./pages/ChangelogPage').then(module => ({ default: module.ChangelogPage })))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(module => ({ default: module.PrivacyPolicyPage })))
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage').then(module => ({ default: module.TermsOfServicePage })))
const DesignSystemPage = lazy(() => import('./pages/DesignSystemPage').then(module => ({ default: module.DesignSystemPage })))
const ThanksPage = lazy(() => import('./pages/ThanksPage').then(module => ({ default: module.ThanksPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })))

function RouteSwitcher() {
  const { path } = useRouter()

  if (path === '/' || path === '') {
    return <HomePage />
  }

  if (path === '/pricing' || path === '/pricing/') {
    return <PricingPage />
  }

  if (path === '/waitlist') {
    return <WaitlistPage />
  }

  if (path === '/contact') {
    return <ContactPage />
  }

  if (path === '/sign-in' || path.startsWith('/sign-in/')) {
    return <SignInPage />
  }

  if (path === '/sign-up' || path.startsWith('/sign-up/')) {
    return <SignUpPage />
  }

  if (path === '/otp') {
    return <SignInPage />
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

function MainContent() {
  const { t } = useLanguage()

  const { path } = useRouter()
  const isDashboard = path === '/account' || path === '/dashboard'

  return (
    <>
      {!isDashboard && <AtmosphericBackground />}
      <Suspense fallback={<main className="relative z-10 p-12" role="status">{t("Loading…")}</main>}><RouteSwitcher /></Suspense>
    </>
  )
}

export default function App() {
  return (
    <>
      <ClerkAuthProvider><RouterProvider>
        <MainContent />
      </RouterProvider></ClerkAuthProvider>
    </>
  )
}
