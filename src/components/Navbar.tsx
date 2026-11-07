import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useSession } from '../services/authService'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const links = [['Features','/#features'],['Use Cases','/#use-cases'],['How It Works','/#how-it-works'],['Pricing','/#pricing'],['Blog','/blog'],['Changelog','/changelog']]
  return <header className="fixed top-0 inset-x-0 z-50 p-4"><nav aria-label="Main navigation" className="max-w-6xl mx-auto rounded-2xl border border-white/10 bg-[#0d1019]/95 backdrop-blur-xl px-5 py-3 flex items-center justify-between gap-4">
    <a href="/" className="font-semibold text-white text-lg">Veyra AI</a>
    <div className="hidden lg:flex items-center gap-5 text-sm text-neutral-300">{links.map(([name,href]) => <a key={href} href={href} className="hover:text-white">{name}</a>)}</div>
    <div className="flex gap-3 items-center text-sm">{session ? <a href="/account" className="rounded-full bg-cyan-400 text-black font-semibold px-4 py-2">Dashboard</a> : <><a href="/sign-in" className="text-white hover:text-cyan-300">Sign In</a><a href="/sign-up" className="rounded-full bg-cyan-400 text-black font-semibold px-4 py-2">Get Started</a></>}
      <button type="button" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)} className="lg:hidden p-2 text-white">{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
    </div>
    {open && <div id="mobile-nav" className="absolute top-full left-4 right-4 p-5 rounded-2xl bg-[#0d1019] border border-white/10 grid gap-4 lg:hidden">{links.map(([name,href]) => <a className="text-neutral-300 hover:text-white" key={href} href={href}>{name}</a>)}</div>}
  </nav></header>
}
