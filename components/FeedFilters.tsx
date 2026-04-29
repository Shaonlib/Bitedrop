'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'MEALS', label: '🍽 Meals' },
  { value: 'BAKED_GOODS', label: '🥖 Baked' },
  { value: 'PRODUCE', label: '🥦 Produce' },
  { value: 'DAIRY', label: '🧀 Dairy' },
  { value: 'BEVERAGES', label: '☕ Drinks' },
  { value: 'SNACKS', label: '🍿 Snacks' },
]

interface Props {
  searchParams: {
    q?: string
    category?: string
    vegan?: string
    glutenFree?: string
  }
}

export function FeedFilters({ searchParams }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams as Record<string, string>)
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="space-y-3">
      {/* Search */}
      <input
        type="search"
        placeholder="Search food, e.g. pasta, sourdough..."
        defaultValue={searchParams.q}
        onChange={(e) => update('q', e.target.value)}
        className="w-full max-w-sm px-4 py-2 text-sm border border-brand-border rounded-lg bg-white focus:outline-none focus:border-brand-dark placeholder:text-brand-muted transition-colors"
      />

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => update('category', cat.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              (searchParams.category ?? '') === cat.value
                ? 'bg-brand-dark text-brand-cream border-brand-dark'
                : 'bg-white border-brand-border text-brand-muted hover:border-brand-dark hover:text-brand-dark'
            }`}
          >
            {cat.label}
          </button>
        ))}

        <button
          onClick={() => update('vegan', searchParams.vegan === 'true' ? '' : 'true')}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            searchParams.vegan === 'true'
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white border-brand-border text-brand-muted hover:border-green-600 hover:text-green-700'
          }`}
        >
          🌱 Vegan
        </button>

        <button
          onClick={() => update('glutenFree', searchParams.glutenFree === 'true' ? '' : 'true')}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            searchParams.glutenFree === 'true'
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-white border-brand-border text-brand-muted hover:border-amber-500 hover:text-amber-700'
          }`}
        >
          🛡 Gluten-free
        </button>
      </div>
    </div>
  )
}
