'use client'

import React from 'react'
import Link from 'next/link'
import { WEBSITE_HOME } from '@/routes/WebsiteRoute'

/**
 * Footer Component
 * Simple premium footer with:
 * - Links
 * - Social media
 * - Copyright
 */
export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 mt-16">
      <div className="px-4 sm:px-6 lg:px-12 py-12">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Rafey</h3>
            <p className="text-sm text-gray-600">
              Premium ethnic wear for the modern, elegant woman.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="#" className="hover:text-foreground transition">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition">
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="#" className="hover:text-foreground transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition">
                  Shipping
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="#" className="hover:text-foreground transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-8">
          {/* Copyright */}
          <div className="text-center text-sm text-gray-600">
            <p>
              © {currentYear} Rafey. All rights reserved. Crafted with elegance.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
