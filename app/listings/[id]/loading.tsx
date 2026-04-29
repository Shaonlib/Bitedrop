export default function ListingLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 w-24 bg-brand-warm rounded mb-6" />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-[4/3] bg-brand-warm rounded-xl" />
        <div className="space-y-4">
          <div className="h-3 w-16 bg-brand-warm rounded" />
          <div className="h-10 w-3/4 bg-brand-warm rounded" />
          <div className="h-4 w-full bg-brand-warm rounded" />
          <div className="h-4 w-2/3 bg-brand-warm rounded" />
          <div className="h-10 w-full bg-brand-warm rounded-lg mt-4" />
        </div>
      </div>
    </div>
  )
}
