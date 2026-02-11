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
            {/* Navigation */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-1 w-full">
              <div className="px-4 sm:px-6 lg:px-12">
                {children}
              </div>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </RootProvider>
      </body>
    </html>
  )
}
