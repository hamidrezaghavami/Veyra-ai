export function Metrics() {
  const stats = [
    { label: 'Tasks automated', value: '1.2M+' },
    { label: 'Saved per user, weekly', value: '14hrs' },
    { label: 'Audit uptime SLA', value: '99.9%' },
    { label: 'Duplicate interception', value: '100%' },
  ]

  return (
    <section className="py-20 border-y border-white/[0.04] bg-[#0d0d0f]/60 backdrop-blur-md relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
          {stats.map((stat, i) => (
            <div key={stat.label} className={`${i !== 0 ? 'md:pl-8' : ''} ${i > 1 ? 'pt-6 md:pt-0' : ''}`}>
              <div className="text-3xl sm:text-4xl font-mono font-medium text-white tracking-tight mb-2">
                {stat.value}
              </div>
              <div className="text-[13px] text-neutral-400 font-normal">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Integration banner note */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-medium text-white mb-2">
            Your financial workflow, connected.
          </h3>
          <p className="text-[14px] text-[#b0b0b0]">
            Extract document details, validate financial records, and explore spending in one platform. Seamless exports to QuickBooks, Xero, NetSuite, and CSV.
          </p>
        </div>
      </div>
    </section>
  )
}
