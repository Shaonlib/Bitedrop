import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NavClient } from '@/components/NavClient'
import { prisma } from '@/lib/prisma'

export async function Navbar() {
  const session = await getServerSession(authOptions)

  let unreadCount = 0
  if (session?.user?.id) {
    unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, read: false },
    })
  }

  return (
    <header className="sticky top-0 z-50 bg-brand-cream border-b border-brand-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl tracking-tight">
          Bite<span className="text-brand-orange">Drop</span>
        </Link>

        <NavClient session={session} unreadCount={unreadCount} />
      </div>
    </header>
  )
}
