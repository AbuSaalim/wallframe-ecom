'use client'

import React, { useState } from 'react'
import { Product, ProductVariant } from '@/types/product'
import ProductGallery from './ProductGallery'
import ProductInfo from './ProductInfo'
import { useDispatch, useSelector } from 'react-redux'
import { toggleWishlist } from '@/store/reducer/wishlistReducer'
import { Heart } from 'lucide-react'

// 👇 1. Related Products component import kiya (Isko hum Step 2 mein banayenge)
import RelatedProducts from './RelatedProducts' 

interface ProductDetailsWrapperProps {
  product: Product
  variants: ProductVariant[]
}

export default function ProductDetailsWrapper({ product: initialProduct, variants }: ProductDetailsWrapperProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined)

  const dispatch = useDispatch()
  const wishlistItems = useSelector((store: any) => store.wishlistStore?.items || [])
  const isWishlisted = wishlistItems.some((item: any) => item._id === initialProduct._id)

  const displayMedia = (selectedVariant?.media && selectedVariant.media.length > 0) 
    ? selectedVariant.media 
    : initialProduct.media

  return (
    <div className="flex flex-col gap-16">
      {/* ==================================== */}
      {/* 1. MAIN PRODUCT DETAILS SECTION */}
      {/* ==================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Left: Gallery */}
        <div className="relative">
          <ProductGallery media={displayMedia} />
          <button 
            onClick={() => dispatch(toggleWishlist(initialProduct))}
            className={`absolute top-4 right-4 z-20 p-3 rounded-full shadow-md backdrop-blur-sm transition-all duration-300 transform hover:scale-110
              ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white/90 text-gray-600 hover:text-red-500'}
            `}
            aria-label="Add to Wishlist"
          >
            <Heart className={`w-6 h-6 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
           <ProductInfo 
              product={initialProduct} 
              variants={variants}
              // @ts-ignore
              onVariantChange={setSelectedVariant} 
           />
        </div>
      </div>

     {/* ==================================== */}
      {/* 2. RELATED PRODUCTS SECTION */}
      {/* ==================================== */}
      <div className="w-full pt-10 border-t border-gray-200">
        <RelatedProducts 
          categoryId={initialProduct.category?._id || initialProduct.category} 
          currentProductId={initialProduct._id} 
        />
      </div>

    </div>
  )
}