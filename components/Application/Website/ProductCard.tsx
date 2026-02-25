'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Product } from '@/types/product'
import { Button } from '@/components/ui/button'

import { useDispatch, useSelector } from 'react-redux'
import { toggleWishlist } from '@/store/reducer/wishlistReducer'
// 👇 1. Cart Actions aur Toast Import kiye
import { addToCart, toggleDrawer } from '@/store/reducer/cartStore'
import { toast } from 'react-toastify'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  // --- Redux Logic Setup ---
  const dispatch = useDispatch()
  const wishlistItems = useSelector((store: any) => store.wishlistStore?.items || [])
  const isWishlisted = wishlistItems.some((item: any) => item._id === product._id)
  // ----------------------------

  const sliderRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  
  const [isDown, setIsDown] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [hasDragged, setHasDragged] = useState(false)

  const hasMedia = product.media && product.media.length > 0
  const hasMultipleImages = product.media && product.media.length > 1
  const hasDiscount = product.discountPercentage > 0

  // 👇 2. Add To Cart Function Banaya
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault() // Link open hone se rokne ke liye
    e.stopPropagation() // Slider move rokne ke liye

    const cartItem = {
      productId: product._id,
      productSlug: product.slug,
      variantId: null, // Quick add mein hum default product bhej rahe hain
      name: product.name,
      image: product.media?.[0]?.secure_url || '/assets/images/placeholder-product.jpg',
      color: null,
      size: null,
      price: product.sellingPrice,
      quantity: 1,
      stock: product.stock || 10
    }

    // Product Cart mein daalo
    dispatch(addToCart(cartItem))
    
    // Success Message dikhao
    toast.success(`${product.name} added to cart!`)
    
    // Cart Drawer Open karo taaki user ko dikhe
    dispatch(toggleDrawer(true))
  }

  const handleScroll = () => {
    if (!sliderRef.current) return
    const width = sliderRef.current.clientWidth
    const scrollPosition = sliderRef.current.scrollLeft
    const newIndex = Math.round(scrollPosition / width)
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
    }
  }

  const scrollToIndex = (index: number) => {
    if (!sliderRef.current) return
    const width = sliderRef.current.clientWidth
    sliderRef.current.scrollTo({ left: width * index, behavior: 'smooth' })
  }

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = (currentIndex + 1) % product.media.length
    scrollToIndex(next)
  }

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const prev = currentIndex === 0 ? product.media.length - 1 : currentIndex - 1
    scrollToIndex(prev)
  }

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (hasMultipleImages && !isHovered && !isDown) {
      timer = setInterval(() => {
        if (sliderRef.current) {
          const next = (currentIndex + 1) % product.media.length
          scrollToIndex(next)
        }
      }, 3000)
    }
    return () => clearInterval(timer)
  }, [hasMultipleImages, currentIndex, isHovered, isDown, product.media?.length])

  const startDrag = (e: React.MouseEvent) => {
    setIsDown(true)
    setHasDragged(false)
    setStartX(e.pageX - sliderRef.current!.offsetLeft)
    setScrollLeft(sliderRef.current!.scrollLeft)
  }

  const stopDrag = () => {
    setIsDown(false)
  }

  const onDrag = (e: React.MouseEvent) => {
    if (!isDown) return
    e.preventDefault()
    const x = e.pageX - sliderRef.current!.offsetLeft
    const walk = (x - startX) * 1.5 
    if (Math.abs(walk) > 5) setHasDragged(true) 
    sliderRef.current!.scrollLeft = scrollLeft - walk
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    if (hasDragged) {
      e.preventDefault()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        stopDrag()
      }}
      className="group flex flex-col w-full bg-white cursor-pointer relative"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50 rounded-sm">
        
        <div 
          ref={sliderRef}
          onScroll={handleScroll}
          onMouseDown={startDrag}
          onMouseUp={stopDrag}
          onMouseMove={onDrag}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} 
        >
          {hasMedia ? (
            product.media.map((img, index) => (
              <div key={img._id || index} className="min-w-full h-full snap-center relative shrink-0">
                <Link href={`/product/${product.slug}`} onClick={handleLinkClick} className="block w-full h-full pointer-events-auto">
                  <Image
                    src={img.secure_url}
                    alt={img.alt || product.name}
                    fill
                    draggable={false} 
                    className="object-cover select-none"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </Link>
              </div>
            ))
          ) : (
            <div className="min-w-full h-full snap-center relative shrink-0">
              <Link href={`/product/${product.slug}`} className="block w-full h-full">
                <Image
                  src="/assets/images/placeholder-product.jpg"
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </Link>
            </div>
          )}
        </div>
        
        {hasMultipleImages && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/70 hover:bg-white text-gray-800 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/70 hover:bg-white text-gray-800 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1 z-20 pointer-events-none">
          {hasDiscount && (
            <span className="bg-white/90 backdrop-blur-sm text-red-600 border border-red-100 text-[10px] uppercase font-bold px-2 py-1 tracking-widest rounded-sm shadow-sm">
              -{product.discountPercentage}%
            </span>
          )}
        </div>

        <button 
          onClick={(e) => {
            e.preventDefault() 
            e.stopPropagation() 
            dispatch(toggleWishlist(product))
          }}
          className={`absolute top-3 right-3 z-20 p-2 rounded-full transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 shadow-sm
            ${isWishlisted ? 'bg-red-50 text-red-500 opacity-100' : 'bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100'}
          `}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
        </button>

        {hasMultipleImages && (
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {product.media.map((_, index) => (
              <span
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'w-4 bg-white shadow-sm' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* 👇 3. Quick Add Button Update (onClick lagaya) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-20 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out bg-gradient-to-t from-black/40 to-transparent flex justify-center">
           <Button 
             onClick={handleAddToCart}
             className="w-full bg-white text-black hover:bg-black hover:text-white rounded-sm font-medium tracking-wide shadow-lg transition-colors h-10"
           >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Quick Add
           </Button>
        </div>
      </div>

      <div className="pt-4 pb-2 flex flex-col gap-1 px-1">
        <div className="flex justify-between items-center">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">
            {product.category?.name || 'Collection'}
          </div>
          <div className="flex items-center gap-1">
             <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
             <span className="text-[10px] text-gray-500 font-medium">
               {product.averageRating?.toFixed(1) || "5.0"}
             </span>
          </div>
        </div>

        <Link href={`/product/${product.slug}`} className="block mt-1">
          <h3 className="font-serif text-base text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-1">
          <span className="font-semibold text-gray-900 text-sm">
            ₹{product.sellingPrice.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.mrp.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}