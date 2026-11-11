export function VeyraWordmark({ className = '' }: { className?: string }) {
  return <a href="/" className={`veyra-wordmark ${className}`} aria-label="Veyra AI">
    <span className="veyra-symbol" aria-hidden="true" />
    <span>Veyra <span className="veyra-ai">ai</span></span>
  </a>
}
