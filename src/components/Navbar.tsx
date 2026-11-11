import { VeyraWordmark } from './VeyraWordmark'
import { useLanguage } from '../context/LanguageContext'
import { LanguageSwitch } from './LanguageSwitch'
import { useState } from 'react'
import { UserButton } from '@clerk/react'
import { Menu, X } from 'lucide-react'
import { useSession } from '../services/authService'

export function Navbar() {
  const { t } = useLanguage()

  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const links = [['Features','/#features'],['Use Cases','/#use-cases'],['How It Works','/#how-it-works'],['Pricing','/pricing'],['Blog','/blog'],['Changelog','/changelog']]
  return <header className="fixed top-0 inset-x-0 z-50 p-4"><nav aria-label={t("Main navigation")} className="max-w-6xl mx-auto rounded-2xl border border-white/10 bg-[#111713]/95 backdrop-blur-xl px-3 sm:px-5 py-3 flex items-center justify-between gap-2 sm:gap-4">
    <VeyraWordmark />
    <div className="hidden xl:flex items-center gap-5 text-sm text-neutral-300">{links.map(([name,href]) => <a key={href} href={href} className="hover:text-white">{t(name)}</a>)}</div>
    <div className="flex gap-2 sm:gap-3 items-center text-xs sm:text-sm"><LanguageSwitch />{session ? <><a href="/account" className="rounded-full bg-cyan-400 text-black font-semibold px-3 sm:px-4 py-2">{t("Dashboard")}</a><UserButton /></> : <><a href="/sign-in" className="hidden sm:inline text-white hover:text-cyan-300">{t("Sign In")}</a><a href="/sign-up" className="rounded-full bg-cyan-400 text-black font-semibold px-3 sm:px-4 py-2">{t("Get Started")}</a></>}
      <button type="button" aria-label={open ? t('Close navigation menu') : t('Open navigation menu')} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)} className="xl:hidden p-1 sm:p-2 text-white">{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
    </div>
    {open && <div id="mobile-nav" className="absolute top-full left-4 right-4 p-5 rounded-2xl bg-[#111713] border border-white/10 grid gap-4 xl:hidden">{links.map(([name,href]) => <a className="text-neutral-300 hover:text-white" key={href} href={href}>{t(name)}</a>)}</div>}
  </nav></header>
}
