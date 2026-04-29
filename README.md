# BiteDrop 🍽

> A community food-sharing platform built with Next.js 14 App Router, React Server Components, Prisma, and NextAuth.

**BiteDrop** lets neighbors post surplus food and claim what others share — reducing waste and building local community. Built as a showcase of modern full-stack Next.js architecture.

---

## ✨ Features

- **Browse & search** — filter by category, dietary requirements, proximity
- **Create listings** — share food with photo upload, expiry timer, and geo tagging
- **Claim system** — claim food items with optional messages, cancel anytime
- **Real-time countdown** — live expiry timers on every listing
- **Notifications** — SSE-powered live alerts when someone claims your food
- **Auth** — OAuth with Google & GitHub via NextAuth
- **Karma scores** — post-exchange reviews build community trust
- **Responsive** — works on mobile and desktop

---

## 🏗 Architecture

This project demonstrates key Next.js 14 patterns:

### React Server Components (RSC)
The feed page, listing detail, profile, and hero stats all run **entirely on the server** — no client-side data fetching boilerplate. Data is fetched directly in async server components using Prisma.

```tsx
// app/page.tsx — pure RSC, zero client JS for data
export default async function FeedPage({ searchParams }) {
  const listings = await prisma.listing.findMany({ ... })
  return <div>{listings.map(l => <ListingCard listing={l} />)}</div>
}
```

### Server Actions
Form mutations (create listing, claim food) use **Next.js Server Actions** — no separate mutation API needed. `revalidatePath()` busts the ISR cache after mutations.

```tsx
// app/actions/listing.ts
'use server'
export async function createListing(formData: FormData) {
  const session = await getServerSession(authOptions)
  await prisma.listing.create({ data: { ...formData, userId: session.user.id } })
  revalidatePath('/')
}
```

### Client Islands
Only interactive bits use `'use client'`: the countdown timer, claim button, filter bar, and nav dropdown. Everything else is server-rendered.

### Route Handlers (REST API)
14 REST endpoints under `/api` for external clients or mobile apps:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/listings` | Paginated feed |
| POST | `/api/listings` | Create listing |
| GET | `/api/listings/[id]` | Single listing |
| PATCH | `/api/listings/[id]` | Update listing |
| DELETE | `/api/listings/[id]` | Delete listing |
| POST | `/api/listings/[id]/claim` | Claim a listing |
| DELETE | `/api/listings/[id]/claim` | Cancel claim |
| GET | `/api/nearby` | Geo-proximity search |
| POST | `/api/upload` | Cloudinary image upload |
| GET | `/api/notifications` | Notifications (+ SSE stream) |
| PATCH | `/api/notifications` | Mark all read |
| GET | `/api/users/[id]` | Public profile |
| PATCH | `/api/users/[id]` | Update profile |
| POST | `/api/reviews` | Submit review |

### Middleware (Edge)
`middleware.ts` runs at the edge to protect routes before the request reaches the server:

```ts
export const config = {
  matcher: ['/share/:path*', '/profile/:path*', '/api/listings/*/claim'],
}
```

### SSE Notifications
Real-time notifications without WebSockets — uses **Server-Sent Events** via a streaming Route Handler:

```ts
// app/api/notifications/route.ts
const readable = new ReadableStream({
  start(controller) {
    const interval = setInterval(async () => {
      const notifications = await prisma.notification.findMany(...)
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(notifications)}\n\n`))
    }, 10000)
    req.signal.addEventListener('abort', () => clearInterval(interval))
  }
})
return new Response(readable, { headers: { 'Content-Type': 'text/event-stream' } })
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | NextAuth.js v4 |
| Image storage | Cloudinary |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or [Supabase](https://supabase.com) free tier)
- Cloudinary account (free tier)
- Google and/or GitHub OAuth app

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/bitedrop.git
cd bitedrop
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
```

### 3. Database setup

```bash
# Push schema to your database
npm run db:push

# (Optional) Seed with demo data
npm run db:seed

# Open Prisma Studio to inspect data
npm run db:studio
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
bitedrop/
├── app/
│   ├── page.tsx                    # Feed (RSC)
│   ├── layout.tsx                  # Root layout
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── loading.tsx
│   ├── actions/
│   │   └── listing.ts              # Server Actions
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth handler
│   │   ├── listings/               # REST: listings CRUD
│   │   ├── nearby/                 # Geo-proximity search
│   │   ├── notifications/          # SSE + notifications
│   │   ├── reviews/                # Review system
│   │   ├── upload/                 # Cloudinary upload
│   │   └── users/[id]/             # User profiles
│   ├── auth/signin/                # Custom sign-in page
│   ├── listings/[id]/              # Listing detail (RSC)
│   ├── profile/                    # User profile (RSC)
│   └── share/                      # Create listing page
├── components/
│   ├── ClaimButton.tsx             # Client island
│   ├── CountdownTimer.tsx          # Client island
│   ├── FeedFilters.tsx             # Client island
│   ├── HeroStats.tsx               # RSC
│   ├── ListingCard.tsx             # RSC
│   ├── ListingCardSkeleton.tsx
│   ├── Navbar.tsx                  # RSC
│   ├── NavClient.tsx               # Client island
│   ├── Providers.tsx               # SessionProvider wrapper
│   ├── ShareForm.tsx               # Client island
│   └── SignInButtons.tsx           # Client island
├── lib/
│   ├── auth.ts                     # NextAuth config
│   ├── cloudinary.ts               # Cloudinary helpers
│   ├── prisma.ts                   # Prisma singleton
│   └── utils.ts                    # Shared utilities
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Demo data seeder
├── types/
│   └── next-auth.d.ts              # Session type extension
└── middleware.ts                   # Edge auth protection
```

---

## 🧠 Key Design Decisions

**Why RSC for the feed?** The feed is read-heavy and mostly public. Running it on the server means zero waterfall fetches, no loading spinners for initial data, and better SEO — the HTML arrives fully populated.

**Why Server Actions over a REST API for mutations?** Server Actions colocate the mutation logic with the form that triggers it. For a single-app use case this removes an entire layer. The REST API routes exist for potential mobile clients.

**Why SSE instead of WebSockets?** SSE is stateless and works on serverless platforms (Vercel) without any additional infrastructure. For low-frequency notifications like "someone claimed your food", polling every 10 seconds via a readable stream is perfectly sufficient.

**Why Prisma over a raw query builder?** Full type safety from schema to query result. The generated types flow into RSC props automatically — no manual type mapping.

---

## 🚢 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env vars
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... etc
```

Set `NEXTAUTH_URL` to your production URL in Vercel's dashboard.

---

## License

MIT
