'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import ProductList from '@/components/Application/Shop/ProductList'
import ProductFilter from '@/components/Application/Shop/ProductFilter'
import ProductSort from '@/components/Application/Shop/ProductSort'

export default function ShopPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* Header / Breadcrumb Area */}
      <div className="bg-gray-50 border-b">
        <div className="container px-4 md:px-6 lg:px-12 py-8 mx-auto">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Shop All</h1>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Shop</span>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 lg:px-12 py-8 mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Mobile Filter Trigger */}
          <div className="lg:hidden flex justify-between items-center mb-4">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <div className="py-4">
                  <h2 className="text-lg font-semibold mb-4">Filters</h2>
                  <ProductFilter />
                </div>
              </SheetContent>
            </Sheet>
            
            <ProductSort />
          </div>

          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              <div>
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                <Separator className="mb-6" />
                <ProductFilter />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500 hidden lg:block">
                Showing results
              </p>
              <div className="hidden lg:block">
                <ProductSort />
              </div>
            </div>

            <ProductList />
          </main>

        </div>
      </div>
    </div>
  )
}
