'use client'

import Link from 'next/link'
import { signIn, signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import Image from 'next/image'
import { Bell, Plus, LogOut, User } from 'lucide-react'
import { useState } from 'react'

interface Props {
  session: Session | null
  unreadCount: number
}

export function NavClient({ session, unreadCount }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  if (!session) {
    return (
      <nav className="flex items-center gap-3">
        <Link
          href="/"
          className="text-sm text-brand-muted hover:text-brand-dark transition-colors"
        >
          Browse
        </Link>
        <button
          onClick={() => signIn()}
          className="text-sm px-4 py-1.5 bg-brand-dark text-brand-cream rounded-lg hover:opacity-80 transition-opacity"
        >
          Sign in
        </button>
      </nav>
    )
  }

  return (
    <nav className="flex items-center gap-2">
      <Link
        href="/share"
        className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-brand-orange text-white rounded-lg hover:opacity-90 transition-opacity"
      >
        <Plus size={14} />
        Share food
      </Link>

      <Link
        href="/api/notifications"
        className="relative p-2 text-brand-muted hover:text-brand-dark transition-colors rounded-lg hover:bg-brand-warm"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-orange text-white text-[9px] font-mono flex items-center justify-center rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 p-1 rounded-lg hover:bg-brand-warm transition-colors"
        >
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? ''}
              width={28}
              height={28}
              className="rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-brand-warm border border-brand-border flex items-center justify-center text-xs font-medium">
              {session.user?.name?.[0] ?? '?'}
            </div>
          )}
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-10 z-20 bg-brand-cream border border-brand-border rounded-xl shadow-sm w-44 py-1 text-sm">
              <div className="px-3 py-2 border-b border-brand-border">
                <p className="font-medium truncate">{session.user?.name}</p>
                <p className="text-xs text-brand-muted truncate">{session.user?.email}</p>
              </div>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-brand-warm transition-colors"
              >
                <User size={13} />
                Profile
              </Link>
              <button
                onClick={() => { setMenuOpen(false); signOut() }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-brand-warm transition-colors text-left text-brand-muted"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
