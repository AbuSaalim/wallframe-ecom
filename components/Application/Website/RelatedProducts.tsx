'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Product } from '@/types/product'
import ProductCard from './ProductCard'
import { Loader2 } from 'lucide-react'

interface RelatedProductsProps {
  categoryId?: string | any;
  currentProductId: string;
}

export default function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!categoryId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const catId = typeof categoryId === 'object' ? categoryId._id : categoryId;
        
        // 🛑 BUG FIXED: Wapas 'products' kar diya (404 error hatane ke liye)
        // Sath hi hum param hata rahe hain taaki saare products aayein aur hum yahan filter karein
        const apiUrl = `/api/public/products` 
        
        const response = await axios.get(apiUrl)

        // Smart Array Extractor
        let fetchedData = [];
        if (Array.isArray(response.data)) {
            fetchedData = response.data;
        } else if (response.data?.products && Array.isArray(response.data.products)) {
            fetchedData = response.data.products;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
            fetchedData = response.data.data;
        } else if (response.data?.data?.products && Array.isArray(response.data.data.products)) {
            fetchedData = response.data.data.products;
        }
        
        if (fetchedData.length > 0) {
          // 🔥 MAGIC HERE: Frontend par category filter aur current product hide kar rahe hain
          const filteredProducts = fetchedData.filter((p: Product) => {
            // Category ID match karo
            const productCatId = typeof p.category === 'object' ? p.category?._id : p.category;
            // Agar category match ho AND wo current product na ho, tabhi dikhao
            return productCatId === catId && p._id !== currentProductId;
          });

          setProducts(filteredProducts.slice(0, 4))
        }
      } catch (error) {
        console.error("❌ Error fetching related products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [categoryId, currentProductId])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Agar category filter hone ke baad koi product nahi bacha, toh hide kar do
  if (products.length === 0) {
    return null; 
  }

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">You May Also Like</h2>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-1">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  )
}