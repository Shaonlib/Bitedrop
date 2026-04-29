import { prisma } from '@/lib/prisma'

export async function HeroStats() {
  const [activeListings, totalUsers, totalShares] = await Promise.all([
    prisma.listing.count({ where: { status: 'AVAILABLE', expiresAt: { gt: new Date() } } }),
    prisma.user.count(),
    prisma.listing.count(),
  ])

  const stats = [
    { value: activeListings, label: 'available now' },
    { value: totalShares, label: 'meals shared' },
    { value: totalUsers, label: 'neighbors' },
  ]

  return (
    <div className="flex gap-8 mt-8">
      {stats.map((s) => (
        <div key={s.label}>
          <p className="font-serif text-3xl text-brand-dark">{s.value}</p>
          <p className="font-mono text-xs tracking-wider uppercase text-brand-muted">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
