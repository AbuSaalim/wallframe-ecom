'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { WEBSITE_HOME, WEBSITE_LOGIN } from '@/routes/WebsiteRoute'
import { Button } from '@/components/ui/button'
import { useSelector, useDispatch } from 'react-redux'
import { 
  ShoppingCart, 
  LogOut, 
  User, 
  Menu, 
  Search, 
  Sparkles, 
  LayoutGrid, 
  Heart, 
  MessageCircle 
} from 'lucide-react'
import { toggleDrawer } from '@/store/reducer/cartStore'
import { logout } from '@/store/reducer/authReducer'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import { useRouter } from 'next/navigation'
import CartDrawer from './CartDrawer'

export default function Navbar() {
  const dispatch = useDispatch()
  const router = useRouter()
  const auth = useSelector((store: any) => store.authStore?.auth)
  const { totalItems } = useSelector((store: any) => store.cartStore)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await axios.post('/api/auth/logout')
      dispatch(logout())
      showToast('success', 'Logged out successfully')
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
      {/* =========================================
          TOP NAVBAR (Responsive)
      ========================================= */}
      <nav className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between">
          
          {/* 1. Mobile Left: Hamburger Menu */}
          <div className="flex items-center md:hidden">
            <button className="p-2 -ml-2 text-gray-700 hover:text-primary transition" aria-label="Menu">
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* 2. Logo (Centered on Mobile, Left on Desktop) */}
          <Link 
            href={WEBSITE_HOME()} 
            className="relative h-8 w-28 md:h-10 md:w-36 transition-opacity hover:opacity-80 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
          >
            <Image
              src="/assets/images/logo.png"
              alt="Rafey Logo"
              fill
              className="object-contain"
              priority
            />
          </Link>

          {/* 3. Desktop Center Navigation Links */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link href="/shop" className="text-sm font-medium text-gray-700 hover:text-primary transition">Shop</Link>
            <Link href="#" className="text-sm font-medium text-gray-700 hover:text-primary transition">Collections</Link>
            <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-primary transition">About</Link>
            <Link href="#" className="text-sm font-medium text-gray-700 hover:text-primary transition">Contact</Link>
          </div>

          {/* 4. Right Side Actions (Search, Cart, Auth) */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search Icon (Visible everywhere) */}
            <button className="p-2 text-gray-700 hover:text-primary transition" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>

            {/* Cart Icon (Visible everywhere) */}
            <button
              onClick={() => dispatch(toggleDrawer(true))}
              className="relative p-2 text-gray-700 hover:text-primary transition"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute 0 right-0 bg-primary text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* Desktop Auth Buttons (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-2 ml-2">
              {auth?.email ? (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/my-account">
                      <User className="h-4 w-4" />
                      
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout} disabled={loggingOut} title="Logout">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button asChild variant="default" size="sm">
                  <Link href={WEBSITE_LOGIN()}>Sign In</Link>
                </Button>
              )}
            </div>
          </div>

        </div>
      </nav>
      
      {/* =========================================
          BOTTOM NAVBAR (Mobile Only)
      ========================================= */}
      <div className="md:hidden fixed bottom-0 left-0 z-50 w-full bg-[#A32A41] text-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center px-6 py-2">
          
          <Link href="/shop?new=true" className="flex flex-col items-center gap-1 opacity-90 hover:opacity-100 transition">
            <Sparkles className="h-5 w-5" />
            <span className="text-[10px] tracking-wider font-medium">New</span>
          </Link>

          <button className="flex flex-col items-center gap-1 opacity-90 hover:opacity-100 transition">
            <LayoutGrid className="h-5 w-5" />
            <span className="text-[10px] tracking-wider font-medium">Menu</span>
          </button>

          <Link href="/wishlist" className="flex flex-col items-center gap-1 opacity-90 hover:opacity-100 transition">
            <Heart className="h-5 w-5" />
            <span className="text-[10px] tracking-wider font-medium">Wishlist</span>
          </Link>

          {/* Apna WhatsApp Number yahan daalein */}
          <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 opacity-90 hover:opacity-100 transition">
            <MessageCircle className="h-5 w-5" />
            <span className="text-[10px] tracking-wider font-medium">WhatsApp</span>
          </a>

        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  )
}