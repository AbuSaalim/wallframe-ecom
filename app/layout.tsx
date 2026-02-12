import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import RootProvider from '@/components/Application/RootProvider'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Rafey - Ethnic Wear',
  description: 'Premium ethnic wear collection inspired by House of Kari',
  keywords: ['ethnic wear', 'luxury', 'clothing', 'saree', 'kurta'],
  authors: [{ name: 'Rafey' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rafey.com',
    title: 'Rafey - Premium Ethnic Wear',
    description: 'Premium ethnic wear collection inspired by House of Kari',
    siteName: 'Rafey',
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

/**
 * RootLayout
 * 
 * REFACTORED LAYOUT STRUCTURE:
 * - This root layout now only provides global providers and HTML structure.
 * - Navbar and Footer are moved to app/(storefront)/layout.tsx.
 * - This ensures admin routes (outside storefront) don't inherit Navbar/Footer.
 * 
 * Structure:
 * - Providers (Redux, Theme, etc.)
 * - Children (nested layouts handle Navbar/Footer as needed)
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <RootProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
        </RootProvider>
      </body>
    </html>
  )
}
