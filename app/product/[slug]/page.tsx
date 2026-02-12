import React from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import ProductDetailsWrapper from '@/components/Application/Website/ProductDetailsWrapper'
import { Product, ProductVariant } from '@/types/product'
import { getProductBySlug } from '@/lib/actions/product'

interface ProductPageProps {
  params: {
    slug: string
  }
}

// Fetch Logic: Direct DB call via server action
async function getProduct(slug: string) {
  try {
    const product = await getProductBySlug(slug);
    return product as (Product & { variants: ProductVariant[] }) | null
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} | Rafey`,
    description: product.description.substring(0, 160),
    openGraph: {
      images: product.media?.[0]?.secure_url ? [product.media[0].secure_url] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const productData = await getProduct(params.slug)

  if (!productData) {
    notFound()
  }
  
  const { variants, ...productOnly } = productData
  
  return (
    <div className="bg-white min-h-screen pb-20">
       <div className="container px-4 md:px-6 lg:px-12 py-8 mx-auto">
          {/* Breadcrumb could go here */}
          <div className="text-sm text-gray-500 mb-6">
             Home / Shop / <span className="text-gray-900 font-medium">{productData.name}</span>
          </div>
          
          <ProductDetailsWrapper 
            product={productData} 
            variants={variants || []} 
          />
       </div>
    </div>
  )
}
