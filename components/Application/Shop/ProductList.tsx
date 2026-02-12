'use client'

import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ProductApiResponse } from '@/types/product'
import ProductCard from '@/components/Application/Website/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'

// Fetcher
const fetchProducts = async (params: string) => {
  const { data } = await axios.get<ProductApiResponse>(`/api/public/products?${params}`)
  return data
}

export default function ProductList() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Construct query string from current URL params
  const queryString = searchParams.toString()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', queryString],
    queryFn: () => fetchProducts(queryString),
    staleTime: 1000 * 60 * 5 // 5 min
  })

  // Pagination Handler
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/shop?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
             <Skeleton className="h-[400px] w-full rounded-sm" />
             <Skeleton className="h-4 w-3/4" />
             <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  // Error State
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-500 mb-4">We couldn't load the products. Please try again.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  const products = data?.data || []
  const pagination = data?.pagination

  // Empty State
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-lg">
        <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
        <Button variant="link" onClick={() => router.push('/shop')} className="mt-2">
          Clear Filters
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4 border-t pt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
