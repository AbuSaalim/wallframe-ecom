'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import { Product } from '@/types/product'
import { Button } from '@/components/ui/button'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  // Use first image or fallback
  const mainImage = product.media?.[0]?.secure_url || '/assets/images/placeholder-product.jpg'
  const altText = product.media?.[0]?.alt || product.name

  // Discount calculation if needed (or use pre-calculated)
  const hasDiscount = product.discountPercentage > 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="group relative flex flex-col w-full bg-white transition-all duration-300 hover:shadow-lg rounded-sm overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={mainImage}
            alt={altText}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-1 tracking-wider shadow-sm">
              -{product.discountPercentage}%
            </span>
          )}
          {/* Example: Check created date for "New" badge logic if needed */}
          {/* <span className="bg-black text-white text-[10px] uppercase font-bold px-2 py-1 tracking-wider shadow-sm">
            New
          </span> */}
        </div>

        {/* Quick Actions (Hover) */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 px-4">
           <Button size="icon" variant="secondary" className="rounded-full h-10 w-10 bg-white hover:bg-primary hover:text-white shadow-md transition-colors">
              <ShoppingBag className="h-4 w-4" />
           </Button>
           <Button size="icon" variant="secondary" className="rounded-full h-10 w-10 bg-white hover:bg-primary hover:text-white shadow-md transition-colors">
              <Heart className="h-4 w-4" />
           </Button>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        
        {/* Category */}
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
          {product.category?.name || 'Collection'}
        </div>

        {/* Title */}
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="font-serif text-lg text-foreground font-medium line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating Placeholder (Static for now as not in schema) */}
        <div className="flex items-center gap-1 mb-1">
           <div className="flex text-yellow-500">
             {[...Array(5)].map((_, i) => (
               <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-current' : 'text-gray-300'}`} />
             ))}
           </div>
           <span className="text-xs text-muted-foreground">(24)</span>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-2 mt-auto">
          <span className="font-semibold text-foreground text-md">
            ₹{product.sellingPrice.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through decoration-red-500/50">
              ₹{product.mrp.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
