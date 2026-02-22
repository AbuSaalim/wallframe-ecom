'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { WEBSITE_HOME, WEBSITE_LOGIN } from '@/routes/WebsiteRoute'
import { Button } from '@/components/ui/button'
import { useSelector, useDispatch } from 'react-redux'
import { ShoppingCart, LogOut, User } from 'lucide-react'
import { toggleDrawer } from '@/store/reducer/cartStore'
import { logout } from '@/store/reducer/authReducer'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const auth = useSelector((store: any) => store.authStore?.auth)
  const { totalItems } = useSelector((store: any) => store.cartStore)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      
      // Call logout API
      await axios.post('/api/auth/logout')
      
      // Dispatch logout to Redux
      dispatch(logout())
      
      showToast('success', 'Logged out successfully')
      
      // Redirect to home
      router.push(WEBSITE_HOME())
    } catch (error) {
      console.error('Logout error:', error)
      showToast('error', 'Logout failed')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={WEBSITE_HOME()} className="relative h-10 w-32 md:h-12 md:w-40 transition-opacity hover:opacity-80">
              <Image
                src="/assets/images/logo.png"
                alt="Rafey Logo"
                fill
                className="object-contain"
                priority
              />
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
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="">
                    <Link href="/my-account">
                      <User className="h-4 w-4 mr-2" />
                      Account
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    disabled={loggingOut}
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
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
