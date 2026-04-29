import { PrismaClient, FoodCategory, ListingStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo users
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice Hansen',
      bio: 'Home cook obsessed with reducing food waste. I make too much pasta.',
      neighborhood: 'Hlíðar',
      karmaScore: 4.8,
      totalShares: 23,
    },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Björn Sigurdsson',
      bio: 'Baker and coffee enthusiast. Weekend sourdough surplus always available.',
      neighborhood: 'Laugardalur',
      karmaScore: 4.9,
      totalShares: 41,
    },
  })

  // Create demo listings
  const now = new Date()
  const listings = [
    {
      title: 'Homemade lasagna – half tray',
      description: 'Made too much for Sunday dinner. Beef & ricotta, serves 4 people easily.',
      servings: 4,
      category: FoodCategory.MEALS,
      lat: 64.1355,
      lng: -21.8954,
      address: 'Hlíðar, Reykjavík',
      expiresAt: new Date(now.getTime() + 3 * 60 * 60 * 1000), // 3 hours
      status: ListingStatus.AVAILABLE,
      userId: alice.id,
    },
    {
      title: 'Sourdough loaves × 2',
      description: 'Fresh this morning. Rye & wheat blend, lightly salted crust.',
      servings: 8,
      category: FoodCategory.BAKED_GOODS,
      lat: 64.1419,
      lng: -21.9113,
      address: 'Laugardalur, Reykjavík',
      expiresAt: new Date(now.getTime() + 8 * 60 * 60 * 1000), // 8 hours
      status: ListingStatus.AVAILABLE,
      isVegan: true,
      userId: bob.id,
    },
    {
      title: 'Dal makhani – big pot',
      description: 'Vegan dal, cooked last night, tastes better today. About 6 portions.',
      servings: 6,
      category: FoodCategory.MEALS,
      lat: 64.1397,
      lng: -21.9205,
      address: 'Miðborg, Reykjavík',
      expiresAt: new Date(now.getTime() + 12 * 60 * 60 * 1000), // 12 hours
      status: ListingStatus.AVAILABLE,
      isVegan: true,
      isGlutenFree: true,
      userId: alice.id,
    },
  ]

  for (const listing of listings) {
    await prisma.listing.create({ data: listing })
  }

  console.log('✅ Seed complete')
  console.log(`   Users: alice (${alice.id}), bob (${bob.id})`)
  console.log(`   Listings: ${listings.length} created`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
