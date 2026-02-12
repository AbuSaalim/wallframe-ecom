import React from 'react'
import Navbar from '@/components/Application/Website/Navbar'
import Footer from '@/components/Application/Website/Footer'

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </>
  )
}
