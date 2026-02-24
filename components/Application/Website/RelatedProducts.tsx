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
        
        // API hit kar rahe hain
        const response = await axios.get(`/api/public/products?category=${catId}`)
        
        // 🛑 Console mein data dhyaan se dekhne ke liye
        console.log("👉 2. FULL API RESPONSE:", response.data)

        // 🧠 Smart Array Extractor (Har tarah ke backend response ko handle karne ke liye)
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

        console.log("👉 3. EXTRACTED ARRAY:", fetchedData)
        
        if (fetchedData.length > 0) {
          // Current product ko remove karo
          const filteredProducts = fetchedData.filter(
            (p: Product) => p._id !== currentProductId
          )
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

  // ⚠️ TEMPORARY DEBUG MESSAGE (Jab error solve ho jaye toh isko wapas 'return null' kar dena)
  // if (!loading && products.length === 0) {
  //   return (
  //      <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-300 rounded-lg mx-4">
  //        <p className="text-gray-500 font-medium">Bhai, is category mein aur koi product database mein nahi hai.</p>
  //        <p className="text-xs text-gray-400 mt-2">Category ID: {typeof categoryId === 'object' ? categoryId._id : categoryId}</p>
  //      </div>
  //   ); 
  // }

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