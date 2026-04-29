'use client'

import { useRef, useState, useTransition } from 'react'
import { createListing } from '@/app/actions/listing'
import toast from 'react-hot-toast'
import { Loader2, Upload, X } from 'lucide-react'

const CATEGORIES = [
  { value: 'MEALS', label: '🍽 Meals' },
  { value: 'BAKED_GOODS', label: '🥖 Baked goods' },
  { value: 'PRODUCE', label: '🥦 Produce' },
  { value: 'DAIRY', label: '🧀 Dairy' },
  { value: 'BEVERAGES', label: '☕ Beverages' },
  { value: 'SNACKS', label: '🍿 Snacks' },
  { value: 'OTHER', label: '📦 Other' },
]

const EXPIRY_OPTIONS = [
  { value: '2', label: '2 hours' },
  { value: '4', label: '4 hours' },
  { value: '8', label: '8 hours' },
  { value: '12', label: '12 hours' },
  { value: '24', label: '24 hours' },
  { value: '48', label: '2 days' },
]

export function ShareForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [isVegan, setIsVegan] = useState(false)
  const [isGlutenFree, setIsGlutenFree] = useState(false)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUri = ev.target?.result as string
      setImagePreview(dataUri)

      // Upload to Cloudinary via API route
      setUploading(true)
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: dataUri }),
        })
        if (res.ok) {
          const { url } = await res.json()
          setImageUrl(url)
        } else {
          toast.error('Image upload failed, continuing without image.')
        }
      } catch {
        toast.error('Image upload failed.')
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('imageUrl', imageUrl)
    fd.set('isVegan', String(isVegan))
    fd.set('isGlutenFree', String(isGlutenFree))

    startTransition(async () => {
      try {
        await createListing(fd)
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to create listing.')
      }
    })
  }

  const inputCls = 'w-full px-3 py-2.5 text-sm border border-brand-border rounded-lg bg-white focus:outline-none focus:border-brand-dark placeholder:text-brand-muted transition-colors'
  const labelCls = 'block text-xs font-mono tracking-wider uppercase text-brand-muted mb-1.5'

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {/* Image upload */}
      <div>
        <label className={labelCls}>Photo</label>
        <div className="relative">
          {imagePreview ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-brand-warm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              {uploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin text-brand-muted" />
                </div>
              )}
              <button
                type="button"
                onClick={() => { setImagePreview(null); setImageUrl('') }}
                className="absolute top-2 right-2 p-1 bg-brand-dark/70 text-white rounded-full"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-brand-border rounded-xl cursor-pointer hover:border-brand-dark/30 transition-colors bg-brand-warm/30">
              <Upload size={20} className="text-brand-muted mb-2" />
              <span className="text-sm text-brand-muted">Click to upload a photo</span>
              <span className="text-xs text-brand-muted/60 mt-1">JPG, PNG, WebP</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className={labelCls}>Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="e.g. Homemade lasagna, half tray"
          className={inputCls}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelCls}>Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Ingredients, portion size, any notes about pickup..."
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Servings + Category */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="servings" className={labelCls}>Servings *</label>
          <input
            id="servings"
            name="servings"
            type="number"
            required
            min="1"
            max="50"
            defaultValue="2"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="category" className={labelCls}>Category</label>
          <select id="category" name="category" className={inputCls}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className={labelCls}>Pickup area</label>
        <input
          id="address"
          name="address"
          type="text"
          placeholder="e.g. Hlíðar, Reykjavík (no exact address needed)"
          className={inputCls}
        />
        <p className="text-xs text-brand-muted mt-1">General area only — exact address shared after claim.</p>
      </div>

      {/* Expiry */}
      <div>
        <label htmlFor="expiresHours" className={labelCls}>Expires in *</label>
        <select id="expiresHours" name="expiresHours" defaultValue="8" className={inputCls}>
          {EXPIRY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Allergens */}
      <div>
        <label htmlFor="allergens" className={labelCls}>Allergens</label>
        <input
          id="allergens"
          name="allergens"
          type="text"
          placeholder="e.g. nuts, dairy, gluten"
          className={inputCls}
        />
      </div>

      {/* Diet toggles */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isVegan}
            onChange={(e) => setIsVegan(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">🌱 Vegan</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isGlutenFree}
            onChange={(e) => setIsGlutenFree(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">🛡 Gluten-free</span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || uploading}
        className="w-full py-3 bg-brand-orange text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
        {isPending ? 'Posting...' : 'Post listing'}
      </button>
    </form>
  )
}
