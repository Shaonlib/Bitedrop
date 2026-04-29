import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { distanceKm } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const lat = Number(searchParams.get('lat'))
  const lng = Number(searchParams.get('lng'))
  const radiusKm = Number(searchParams.get('radius') ?? 5)

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 })
  }

  // Fetch a broad bounding box, then filter precisely in JS
  // (For production, use PostGIS: ST_DWithin)
  const degreeRadius = radiusKm / 111 // ~1 degree = 111km
  const listings = await prisma.listing.findMany({
    where: {
      status: 'AVAILABLE',
      expiresAt: { gt: new Date() },
      lat: { gte: lat - degreeRadius, lte: lat + degreeRadius },
      lng: { gte: lng - degreeRadius * 2, lte: lng + degreeRadius * 2 },
    },
    include: {
      user: { select: { id: true, name: true, image: true, karmaScore: true } },
      _count: { select: { claims: true } },
    },
    take: 50,
  })

  const results = listings
    .map((l) => ({ ...l, distanceKm: distanceKm(lat, lng, l.lat, l.lng) }))
    .filter((l) => l.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)

  return NextResponse.json(results)
}
