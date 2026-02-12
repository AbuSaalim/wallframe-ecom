'use client'

import React from 'react'
import Link from 'next/link'
import { WEBSITE_HOME, WEBSITE_LOGIN } from '@/routes/WebsiteRoute'
import { Button } from '@/components/ui/button'
import { useSelector, useDispatch } from 'react-redux'
import { ShoppingCart } from 'lucide-react'
import { toggleDrawer } from '@/store/reducer/cartStore'
import CartDrawer from './CartDrawer'

/**
 * Navbar Component
 * Premium navigation bar with:
 * - Logo/Brand
 * - Navigation links
 * - Cart icon with badge
 * - Auth buttons
 */
export default function Navbar() {
  const dispatch = useDispatch()
  const auth = useSelector((store: any) => store.authStore?.auth)
  const { totalItems } = useSelector((store: any) => store.cartStore)

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={WEBSITE_HOME()} className="text-2xl font-bold text-foreground hover:text-primary transition">
              Rafey
            </Link>

            {/* Center Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/shop" className="text-sm font-medium text-foreground hover:text-primary transition">
                Shop
              </Link>
              <Link href="#" className="text-sm font-medium text-foreground hover:text-primary transition">
                Collections
              </Link>
              <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition">
                About
              </Link>
              <Link href="#" className="text-sm font-medium text-foreground hover:text-primary transition">
                Contact
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Cart Icon */}
              <button
                onClick={() => dispatch(toggleDrawer(true))}
                className="relative p-2 text-gray-700 hover:text-primary transition"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>

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
      
      {/* Cart Drawer */}
      <CartDrawer />
    </>
  )
}
