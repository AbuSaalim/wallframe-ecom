'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Category } from '@/types/product'

/**
 * Filter Component for Shop Page
 * - Categories (Checkbox/Radio)
 * - Price Range (Slider)
 */

interface CategoryResponse {
  success: boolean
  data: Category[]
}

const fetchCategories = async () => {
  const { data } = await axios.get<CategoryResponse>('/api/public/categories')
  return data
}

export default function ProductFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current filters from URL
  const currentCategory = searchParams.get('category')
  const minPrice = searchParams.get('minPrice') || '0'
  const maxPrice = searchParams.get('maxPrice') || '10000'

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 60 // 1 hour
  })

  // Handlers
  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (currentCategory === slug) {
      params.delete('category')
    } else {
      params.set('category', slug)
    }
    params.set('page', '1') // Reset page on filter change
    router.push(`/shop?${params.toString()}`)
  }

  const handlePriceChange = (value: number[]) => {
    // Only update on commit (mouseup) to avoid too many refreshes, or use local state and Apply button
    // For simplicity, we might want a local state and "Apply" button for price
  }

  const [priceRange, setPriceRange] = React.useState([parseInt(minPrice), parseInt(maxPrice)])

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('minPrice', priceRange[0].toString())
    params.set('maxPrice', priceRange[1].toString())
    params.set('page', '1')
    router.push(`/shop?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/shop')
    setPriceRange([0, 10000])
  }

  return (
    <div className="space-y-8">
      
      {/* Categories */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Categories</h3>
        {isLoading ? (
           <div className="space-y-2">
             <Skeleton className="h-4 w-3/4" />
             <Skeleton className="h-4 w-1/2" />
             <Skeleton className="h-4 w-2/3" />
           </div>
        ) : (
          <div className="space-y-3">
            {categoriesData?.data.map((cat) => (
              <div key={cat._id} className="flex items-center space-x-2">
                <Checkbox 
                  id={cat.slug} 
                  className="rounded-sm"
                  checked={currentCategory === cat.slug}
                  onCheckedChange={() => handleCategoryChange(cat.slug)}
                />
                <label 
                  htmlFor={cat.slug} 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {cat.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Price Range</h3>
        <div className="px-1">
          <Slider
            defaultValue={[0, 10000]}
            max={20000}
            step={100}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mb-4"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}+</span>
        </div>
        <Button onClick={applyPriceFilter} variant="outline" size="sm" className="w-full text-xs">
          Apply Price
        </Button>
      </div>

      {/* Clear Filters */}
      <Button variant="ghost" size="sm" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50" onClick={clearFilters}>
        Clear All Filters
      </Button>

    </div>
  )
}
