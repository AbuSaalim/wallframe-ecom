'use client'

import React, { useState, useRef, MouseEvent } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Media } from '@/types/product'

interface ProductGalleryProps {
  media: Media[]
}

export default function ProductGallery({ media }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ opacity: 0 })
  const imageRef = useRef<HTMLDivElement>(null)

  if (!media || media.length === 0) {
    return <div className="aspect-[3/4] bg-gray-100 rounded-lg" />
  }

  const activeImage = media[selectedIndex]

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return

    const { left, top, width, height } = imageRef.current.getBoundingClientRect()
    const x = ((e.pageX - left) / width) * 100
    const y = ((e.pageY - top) / height) * 100

    setZoomStyle({
      opacity: 1,
      backgroundImage: `url(${activeImage.secure_url})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%' // Zoom level
    })
  }

  const handleMouseLeave = () => {
    setZoomStyle({ opacity: 0 })
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnails (Left on Desktop, Bottom on Mobile) */}
      <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] scrollbar-hide">
        {media.map((item, index) => (
          <button
            key={item._id}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "relative w-20 h-20 lg:w-24 lg:h-32 flex-shrink-0 border-2 rounded-md overflow-hidden transition-all",
              selectedIndex === index ? "border-primary" : "border-transparent hover:border-gray-200"
            )}
          >
            <Image
              src={item.secure_url}
              alt={item.alt || 'Product thumbnail'}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image with Zoom */}
      <div 
        className="relative flex-1 aspect-[3/4] lg:h-[600px] bg-gray-50 rounded-lg overflow-hidden cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        ref={imageRef}
      >
        {/* Base Image */}
        <Image
          src={activeImage.secure_url}
          alt={activeImage.alt || 'Product image'}
          fill
          className="object-cover"
          priority={selectedIndex === 0}
        />

        {/* Zoom Overlay (Shows on Hover) */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-200 bg-no-repeat z-10"
          style={zoomStyle}
        />
      </div>
    </div>
  )
}
