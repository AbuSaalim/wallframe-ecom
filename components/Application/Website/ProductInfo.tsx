'use client'

import React, { useState, useEffect } from 'react'
import { Product, ProductVariant } from '@/types/product'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Heart, Share2, Star, Truck, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '@/store/reducer/cartStore'
// 👇 1. Wishlist action import kiya
import { toggleWishlist } from '@/store/reducer/wishlistReducer'
import { toast } from 'react-toastify'

interface ProductInfoProps {
  product: Product
  variants: ProductVariant[]
  onVariantChange?: (variant: ProductVariant | undefined) => void
}

export default function ProductInfo({ product, variants, onVariantChange }: ProductInfoProps) {
  const dispatch = useDispatch()
  
  // 👇 2. Wishlist State Check karna
  const wishlistItems = useSelector((store: any) => store.wishlistStore?.items || [])
  const isWishlisted = wishlistItems.some((item: any) => item._id === product._id)
  
  // Extract unique colors and sizes
  const uniqueColors = Array.from(new Set(variants.map(v => v.color))).filter(Boolean)
  const uniqueSizes = Array.from(new Set(variants.map(v => v.size))).filter(Boolean)

  const [selectedColor, setSelectedColor] = useState<string>(uniqueColors[0] || '')
  const [selectedSize, setSelectedSize] = useState<string>(uniqueSizes[0] || '')
  const [currentVariant, setCurrentVariant] = useState<ProductVariant | undefined>(undefined)

  // Update current variant when selection changes
  useEffect(() => {
    const variant = variants.find(
      v => v.color === selectedColor && v.size === selectedSize
    )
    setCurrentVariant(variant)
    if (onVariantChange) {
      onVariantChange(variant)
    }
  }, [selectedColor, selectedSize, variants, onVariantChange])

  // Determine Price to show (Variant price or Product default)
  const displayPrice = currentVariant ? currentVariant.sellingPrice : product.sellingPrice
  const displayMrp = currentVariant ? currentVariant.mrp : product.mrp
  const discount = Math.round(((displayMrp - displayPrice) / displayMrp) * 100)

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!currentVariant) {
      toast.error('Please select a valid combination')
      return
    }

    const cartItem = {
      productId: product._id,
      productSlug: product.slug,
      variantId: currentVariant._id,
      name: product.name,
      image: currentVariant.media?.[0]?.secure_url || product.media?.[0]?.secure_url || '',
      color: currentVariant.color,
      size: currentVariant.size,
      price: currentVariant.sellingPrice,
      quantity: 1,
      stock: currentVariant.stock || 0
    }

    dispatch(addToCart(cartItem))
    toast.success(`Added ${product.name} to cart!`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title & Rating */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{product.name}</h1>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center text-yellow-500 gap-1">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-medium text-gray-900">{product.averageRating?.toFixed(1) || '0'}</span>
          </div>
          <span className="text-gray-400">|</span>
          <span className="text-gray-500">{product.totalReviews || 0} Reviews</span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold text-gray-900">₹{displayPrice.toLocaleString('en-IN')}</span>
        {discount > 0 && (
          <>
            <span className="text-lg text-gray-400 line-through mb-1">₹{displayMrp.toLocaleString('en-IN')}</span>
            <span className="text-sm font-bold text-red-500 mb-2">({discount}% OFF)</span>
          </>
        )}
      </div>

      <div className="text-sm text-gray-500">
        Inclusive of all taxes
      </div>

      <Separator className="my-4" />

      {/* Variants */}
      <div className="space-y-6">
        
        {/* Color Selector */}
        {uniqueColors.length > 0 && (
          <div>
            <span className="block text-sm font-medium text-gray-900 mb-3">Color: <span className="text-gray-500">{selectedColor}</span></span>
            <div className="flex flex-wrap gap-3">
              {uniqueColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center",
                    selectedColor === color ? "border-primary scale-110" : "border-transparent hover:border-gray-200"
                  )}
                  style={{ backgroundColor: color.toLowerCase() }} 
                  title={color}
                >
                    <span className="sr-only">{color}</span>
                    {selectedColor === color && <span className="block w-2.5 h-2.5 bg-white rounded-full shadow-sm" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size Selector */}
        {uniqueSizes.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
               <span className="block text-sm font-medium text-gray-900">Size: <span className="text-gray-500">{selectedSize}</span></span>
               <button className="text-xs text-primary underline">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-3">
              {uniqueSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "h-10 min-w-[3rem] px-3 rounded-md border text-sm font-medium transition-all",
                    selectedSize === size 
                      ? "border-primary bg-primary text-primary-foreground" 
                      : "border-gray-200 text-gray-900 hover:border-gray-900"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-4">
        <Button 
          variant="default"
          size="lg" 
          className="flex-1 h-12 text-base rounded-full"
          onClick={handleAddToCart}
          disabled={!currentVariant}
        >
          {currentVariant ? 'Add to Cart' : 'Unavailable'}
        </Button>
        
        {/* 👇 3. Updated Heart Button */}
        <Button 
          size="lg" 
          variant="outline" 
          className={cn(
            "h-12 w-12 rounded-full p-0 transition-colors duration-300",
            isWishlisted ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100 hover:text-red-600" : "hover:text-red-500 hover:bg-gray-50 hover:border-red-200"
          )}
          onClick={() => dispatch(toggleWishlist(product))}
        >
          <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
        </Button>

        <Button size="lg" variant="outline" className="h-12 w-12 rounded-full p-0 hover:bg-gray-50 hover:text-primary transition-colors">
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Trust Signals */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Truck className="w-5 h-5 text-gray-500" />
          <div className="text-xs">
            <p className="font-medium text-gray-900">Free Shipping</p>
            <p className="text-gray-500">On orders over ₹999</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-gray-500" />
          <div className="text-xs">
            <p className="font-medium text-gray-900">Secure Payment</p>
            <p className="text-gray-500">100% Protected</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-6">
        <h3 className="font-medium text-gray-900 mb-2">Description</h3>
        <div className="prose prose-sm text-gray-500" dangerouslySetInnerHTML={{ __html: product.description }} /> 
      </div>

    </div>
  )
}