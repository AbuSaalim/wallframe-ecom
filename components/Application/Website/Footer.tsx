'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube,
  ShieldCheck,
  CreditCard,
  Truck,
  Gift,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

/**
 * Footer Component
 * 
 * Renders ONCE in the RootLayout.
 * Features:
 * - 4-column responsive grid
 * - Trust signals
 * - Newsletter signup
 * - Social links
 * - Copyright with dynamic year
 */
export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-white border-t border-gray-100 mt-auto">
      {/* Top Section: Trust Signals */}
      <div className="w-full bg-gray-50/50 py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center text-center">
            
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <ShieldCheck className="w-6 h-6 text-primary/80" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-foreground">Secure Payments</h4>
                <p className="text-xs text-muted-foreground">Certified SSL Encrypted</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Truck className="w-6 h-6 text-primary/80" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-foreground">Free Shipping</h4>
                <p className="text-xs text-muted-foreground">On orders over ₹999</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Gift className="w-6 h-6 text-primary/80" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-foreground">Gift Wrapping</h4>
                <p className="text-xs text-muted-foreground">Available on checkout</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <CreditCard className="w-6 h-6 text-primary/80" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-foreground">COD Available</h4>
                <p className="text-xs text-muted-foreground">Pay on delivery</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Column 1: Brand & Social */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-serif font-bold text-foreground">Rafey</h3>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Celebrating the elegance of ethnic wear with a modern touch. 
                Premium quality fabrics and designs inspired by tradition.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-200">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-200">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-200">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-200">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>

          {/* Column 2: Shop Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-6">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/new-arrivals" className="text-muted-foreground hover:text-primary transition-colors inline-block relative group">
                  New Arrivals
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-muted-foreground hover:text-primary transition-colors inline-block relative group">
                  Kurtas & Sets
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link href="/sarees" className="text-muted-foreground hover:text-primary transition-colors inline-block relative group">
                  Sarees
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link href="/best-sellers" className="text-muted-foreground hover:text-primary transition-colors inline-block relative group">
                  Best Sellers
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link href="/sale" className="text-red-500 hover:text-red-600 transition-colors font-medium">
                  Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h4 className="font-semibold text-foreground mb-6">Support</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors inline-block relative group">
                  Contact Us
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors inline-block relative group">
                  FAQs
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-primary transition-colors inline-block relative group">
                  Shipping & Returns
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-muted-foreground hover:text-primary transition-colors inline-block relative group">
                  Track Order
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <div className="pt-2 text-xs text-muted-foreground">
                  <p>Mon - Sat: 9am - 7pm</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="font-semibold text-foreground mb-6">Stay in Touch</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to our newsletter for exclusive offers and updates.
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              By subscribing, you agree to our Privacy Policy.
            </p>
          </div>

        </div>

        <Separator className="my-8" />

        {/* Bottom Bar: Copyright & Legal Links */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>
            © {currentYear} Rafey. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/sitemap" className="hover:text-primary transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
