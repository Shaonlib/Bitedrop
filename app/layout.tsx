import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Navbar } from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: { default: 'BiteDrop', template: '%s | BiteDrop' },
  description: 'Share surplus food with your neighbors. Reduce waste, build community.',
  keywords: ['food sharing', 'food waste', 'community', 'neighbors'],
  openGraph: {
    title: 'BiteDrop',
    description: 'Share surplus food with your neighbors.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1A1208',
                color: '#FAF7F2',
                fontFamily: 'Instrument Sans, sans-serif',
                fontSize: '13px',
                borderRadius: '8px',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
