import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import RootProvider from '@/components/Application/RootProvider'
import Navbar from '@/components/Application/Website/Navbar'
import Footer from '@/components/Application/Website/Footer'

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
 * FIX FOR DUPLICATE FOOTER:
 * 1. The Footer is rendered ONLY here in the root layout.
 * 2. It is placed outside the <main> tag but inside the flex wrapper to ensure it stays at the bottom.
 * 3. No other layout file (e.g., app/(root)/(website)/layout.tsx) should render <Footer />.
 * 4. No individual page (e.g., app/page.tsx) should render <Footer />.
 * 
 * Structure:
 * - Providers (Redux, Theme, etc.)
 * - Navbar (Sticky top)
 * - Main (Flex-1 to push footer down)
 * - Footer (Global footer)
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
            {/* 
              Navbar is rendered once here at the root level.
              It is sticky by default (handled in Navbar component).
            */}
            <Navbar />

            {/* 
              Main Content Area 
              flex-1 ensures it takes up remaining space, pushing footer to bottom 
              if content is short.
            */}
            <main className="flex-1 w-full">
              {children}
            </main>

            {/* 
              Footer is rendered ONCE here. 
              Do not add <Footer /> to any other layout or page.
            */}
            <Footer />
          </div>
        </RootProvider>
      </body>
    </html>
  )
}
