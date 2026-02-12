'use client'

import React from 'react'
import Link from 'next/link'
import { WEBSITE_HOME, WEBSITE_LOGIN } from '@/routes/WebsiteRoute'
import { Button } from '@/components/ui/button'
import { useSelector } from 'react-redux'

/**
 * Navbar Component
 * Premium navigation bar with:
 * - Logo/Brand
 * - Navigation links
 * - Search (placeholder)
 * - Cart icon
 * - Auth buttons
 */
export default function Navbar() {
  const auth = useSelector((store: any) => store.authStore?.auth)

  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-12 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={WEBSITE_HOME()} className="text-2xl font-bold text-foreground hover:text-primary transition">
            Rafey
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-sm font-medium text-foreground hover:text-primary transition">
              Collections
            </Link>
            <Link href="#" className="text-sm font-medium text-foreground hover:text-primary transition">
              About
            </Link>
            <Link href="#" className="text-sm font-medium text-foreground hover:text-primary transition">
              Contact
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {auth?.email ? (
              <Button asChild variant="outline" size="sm" className="">
                <Link href="/my-account">Account</Link>
              </Button>
            ) : (
              <Button asChild variant="default" size="sm" className="">
                <Link href={WEBSITE_LOGIN()}>Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
