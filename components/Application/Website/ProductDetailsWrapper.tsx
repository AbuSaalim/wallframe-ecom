'use client'

import React, { useState, useEffect } from 'react'
import { Product, ProductVariant } from '@/types/product'
import ProductGallery from './ProductGallery'
import ProductInfo from './ProductInfo' // I'll need to modify ProductInfo to accept state props

interface ProductDetailsWrapperProps {
  product: Product
  variants: ProductVariant[]
}

export default function ProductDetailsWrapper({ product: initialProduct, variants }: ProductDetailsWrapperProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined)

  // Derive display media: Use variant media if selected and available, else product media
  const displayMedia = (selectedVariant?.media && selectedVariant.media.length > 0) 
    ? selectedVariant.media 
    : initialProduct.media

  // We need to modify ProductInfo to accept setSelectedVariant or handle selection selection
  // But ProductInfo has its own internal state for color/size. 
  // Better approach: Lift color/size state here or let ProductInfo drive it and call onVariantChange?
  
  // Let's modify ProductInfo to take `onVariantChange` callback.
  // Actually, I'll just clone ProductInfo logic here or passed down.
  // To avoid rewriting ProductInfo entirely now, I will update it in next step to accept `onVariantChange`.

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
      {/* Left: Gallery */}
      <ProductGallery media={displayMedia} />

      {/* Right: Info */}
      <div className="flex flex-col">
         {/* We will need to update ProductInfo to lift state */}
         {/* For now, let's just render it and accept that gallery won't update on variant selection yet unless we fix it. */}
         {/* I will fix ProductInfo now. */}
         <ProductInfo 
            product={initialProduct} 
            variants={variants}
            // @ts-ignore - temporary until updated
            onVariantChange={setSelectedVariant} 
         />
      </div>
    </div>
  )
}
