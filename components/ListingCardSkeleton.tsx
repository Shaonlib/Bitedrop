export function ListingCardSkeleton() {
  return (
    <div className="border border-brand-border rounded-xl overflow-hidden bg-white animate-pulse">
      <div className="aspect-[4/3] bg-brand-warm" />
      <div className="p-3 space-y-2">
        <div className="h-2.5 w-16 bg-brand-warm rounded" />
        <div className="h-4 w-3/4 bg-brand-warm rounded" />
        <div className="h-3 w-1/2 bg-brand-warm rounded" />
        <div className="h-px bg-brand-warm mt-3" />
        <div className="flex justify-between">
          <div className="h-3 w-20 bg-brand-warm rounded" />
          <div className="h-3 w-12 bg-brand-warm rounded" />
        </div>
      </div>
    </div>
  )
}
