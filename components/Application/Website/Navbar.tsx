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
  MessageCircle,
  Package,
  X,
  ChevronRight
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 👇 Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await axios.post('/api/auth/logout')
      dispatch(logout())
      showToast('success', 'Logged out successfully')
      router.push(WEBSITE_HOME())
      setIsDropdownOpen(false)
      setIsMobileMenuOpen(false) // Mobile menu bhi band karo
    } catch (error) {
      console.error('Logout error:', error)
      showToast('error', 'Logout failed')
    } finally {
      setLoggingOut(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      {/* =========================================
          TOP NAVBAR
      ========================================= */}
      <nav className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between relative">
          
          {/* 1. LEFT SECTION */}
          <div className="flex-1 flex items-center justify-start">
            {/* Mobile Hamburger - Menu open karega */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-700 hover:text-primary transition" 
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href={WEBSITE_HOME()} className="hidden md:block relative h-10 w-36 transition-opacity hover:opacity-80">
              <Image src="/assets/images/logo.png" alt="Rafey Logo" fill className="object-contain" priority />
            </Link>
          </div>

          {/* 2. CENTER SECTION */}
          <div className="flex-1 flex items-center justify-center">
            <Link href={WEBSITE_HOME()} className="md:hidden relative h-8 w-28 transition-opacity hover:opacity-80">
              <Image src="/assets/images/logo.png" alt="Rafey Logo" fill className="object-contain" priority />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/shop" className="text-sm font-medium text-gray-700 hover:text-primary transition">Shop</Link>
              <Link href="#" className="text-sm font-medium text-gray-700 hover:text-primary transition">Collections</Link>
              <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-primary transition">About</Link>
              <Link href="#" className="text-sm font-medium text-gray-700 hover:text-primary transition">Contact</Link>
            </div>
          </div>

          {/* 3. RIGHT SECTION */}
          <div className="flex-1 flex items-center justify-end gap-3 md:gap-4">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1 text-gray-700 hover:text-primary transition focus:outline-none" 
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <button
              onClick={() => dispatch(toggleDrawer(true))}
              className="relative p-1 text-gray-700 hover:text-primary transition focus:outline-none mr-2 md:mr-0"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            <div className="hidden md:flex items-center relative">
              {auth?.email ? (
                <>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-1 pr-3 border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none"
                  >
                    {auth.photoURL ? (
                      <img src={auth.photoURL} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">
                      {auth.displayName?.split(' ')[0] || 'Account'}
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b border-gray-50 mb-1 bg-gray-50/50">
                          <p className="text-sm font-semibold text-gray-900 truncate">{auth.displayName}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{auth.email}</p>
                        </div>
                        <div className="flex flex-col py-1">
                          <Link href="/my-account" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"><User className="w-4 h-4" /> My Profile</Link>
                          <Link href="/my-account" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"><Package className="w-4 h-4" /> Orders</Link>
                          <Link href="/my-account" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"><Heart className="w-4 h-4" /> Wishlist</Link>
                        </div>
                        <div className="border-t border-gray-100 mt-1 pt-1 px-2">
                          <button onClick={handleLogout} disabled={loggingOut} className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors w-full text-left">
                            <LogOut className="w-4 h-4" /> {loggingOut ? 'Logging out...' : 'Logout'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Button asChild variant="default" size="sm" className="rounded-full px-6">
                  <Link href={WEBSITE_LOGIN()}>Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* SEARCH OVERLAY */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-md p-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input autoFocus type="text" placeholder="Search for products, categories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-12 pl-12 pr-12 rounded-full border-2 border-primary/20 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary transition-all text-sm md:text-base" />
              <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute right-4 p-1 text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </nav>
      
      {/* =========================================
          BOTTOM NAVBAR (Mobile Only)
      ========================================= */}
      <div className="md:hidden fixed bottom-0 left-0 z-30 w-full bg-[#A32A41] text-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center px-6 py-2">
          <Link href="/shop?new=true" className="flex flex-col items-center gap-1 opacity-90 hover:opacity-100 transition">
            <Sparkles className="h-5 w-5" />
            <span className="text-[10px] tracking-wider font-medium">New</span>
          </Link>
          
          {/* 👇 Mobile Bottom Menu Trigger */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 opacity-90 hover:opacity-100 transition"
          >
            <LayoutGrid className="h-5 w-5" />
            <span className="text-[10px] tracking-wider font-medium">Menu</span>
          </button>

          <Link href="/my-account" className="flex flex-col items-center gap-1 opacity-90 hover:opacity-100 transition">
            <Heart className="h-5 w-5" />
            <span className="text-[10px] tracking-wider font-medium">Wishlist</span>
          </Link>
          <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 opacity-90 hover:opacity-100 transition">
            <MessageCircle className="h-5 w-5" />
            <span className="text-[10px] tracking-wider font-medium">WhatsApp</span>
          </a>
        </div>
      </div>

      {/* =========================================
          MOBILE SLIDE MENU DRAWER
      ========================================= */}
      {isMobileMenuOpen && (
        <>
          {/* Dark Overlay (Click to close) */}
          <div 
            className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-300 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer Menu */}
          <div className="fixed top-0 left-0 h-full w-[80%] max-w-[320px] bg-white z-50 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 md:hidden">
            
            {/* Drawer Header & Profile */}
            <div className="bg-gray-50 p-6 border-b border-gray-100 relative">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-white rounded-full shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
              
              {auth?.email ? (
                <div className="flex items-center gap-4 mt-2">
                  {auth.photoURL ? (
                    <img src={auth.photoURL} alt="Profile" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">{auth.displayName || 'User'}</h3>
                    <p className="text-xs text-gray-500">{auth.email}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <h3 className="font-serif font-bold text-xl mb-3 text-gray-900">Welcome!</h3>
                  <Button asChild className="w-full rounded-full" onClick={() => setIsMobileMenuOpen(false)}>
                    <Link href={WEBSITE_LOGIN()}>Login / Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Menu Links */}
            <div className="flex-1 overflow-y-auto py-4 px-4 flex flex-col gap-1">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg">
                Home <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg">
                Shop All <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg">
                Collections <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg">
                About Us <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg">
                Contact <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              {auth?.email && (
                <>
                  <div className="h-px bg-gray-200 my-4 mx-2" />
                  <Link href="/my-account" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400" /> My Account
                  </Link>
                  <Link href="/my-account" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 text-gray-700 font-medium hover:bg-gray-50 rounded-lg">
                    <Package className="w-5 h-5 text-gray-400" /> Orders
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-3 p-3 text-red-600 font-medium hover:bg-red-50 rounded-lg text-left mt-2">
                    <LogOut className="w-5 h-5 text-red-500" /> Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <CartDrawer />
    </>
  )
}