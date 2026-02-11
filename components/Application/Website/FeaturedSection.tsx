'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Product, ProductApiResponse } from '@/types/product'
import ProductCard from './ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

// Fetcher function
const fetchProducts = async (limit: number = 8) => {
  const { data } = await axios.get<ProductApiResponse>(`/api/public/products?limit=${limit}&sort=-createdAt`)
  return data
}

export default function FeaturedSection() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => fetchProducts(8),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    retry: 1
  })

  // Loading State
  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container px-4 md:px-6 lg:px-12 mx-auto">
          <div className="flex flex-col items-center mb-12 space-y-4 text-center">
            <Skeleton className="h-8 w-64 rounded-md" />
            <Skeleton className="h-4 w-96 rounded-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[400px] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Error State
  if (isError) {
    return (
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto text-center">
          <div className="inline-flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-full mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load products</h3>
          <p className="text-gray-500 mb-6">
            We're having trouble fetching the latest collection. Please try again later.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </section>
    )
  }

  const products = data?.data || []

  // Empty State
  if (products.length === 0) {
    return (
      <section className="py-16 bg-white text-center">
        <h2 className="text-3xl font-serif font-bold mb-4">New Arrivals</h2>
        <p className="text-muted-foreground">Coming Soon. Stay tuned for our exclusive collection.</p>
      </section>
    )
  }

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container px-4 md:px-6 lg:px-12 mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col items-center mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            New Arrivals
          </h2>
          <div className="w-24 h-1 bg-primary mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed font-light">
            Discover the latest additions to our premium ethnic wear collection. 
            Handcrafted elegance for the modern woman.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-12">
          <Button variant="outline" size="lg" className="rounded-full px-8 border-primary/20 hover:bg-primary hover:text-white transition-all duration-300">
            View All Products
          </Button>
        </div>

      </div>
    </section>
  )
}
