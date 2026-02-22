import React from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import ProductDetailsWrapper from '@/components/Application/Website/ProductDetailsWrapper'
import { Product, ProductVariant } from '@/types/product'
import { getProductBySlug } from '@/lib/actions/product'

// 👇 UPDATE 1: params ab ek Promise hai Next.js ke naye version mein
interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
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
  // 👇 UPDATE 2: params ko pehle await karna zaroori hai
  const resolvedParams = await params;
  
  const product = await getProduct(resolvedParams.slug)
  if (!product) {
    return {
      title: 'Product Not Found | Rafey',
    }
  }

  return {
    title: `${product.name} | Rafey`,
    description: product.description?.substring(0, 160) || 'Premium Products',
    openGraph: {
      images: product.media?.[0]?.secure_url ? [product.media[0].secure_url] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  // 👇 UPDATE 3: yahan bhi params ko await karna hai
  const resolvedParams = await params;
  
  console.log("👉 URL se aaya hua slug:", resolvedParams.slug);
  
  const productData = await getProduct(resolvedParams.slug)
  
  console.log("👉 Database Response:", productData ? "Product Mil Gaya ✅" : "Product NAHI Mila ❌");

  if (!productData) {
    notFound()
  }
  
  const { variants, ...productOnly } = productData
  
  return (
    <div className="bg-white min-h-screen pb-20">
       <div className="container px-4 md:px-6 lg:px-12 py-8 mx-auto">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-6">
             Home / Shop / <span className="text-gray-900 font-medium">{productData.name}</span>
          </div>
          
          {/* Main Product Wrapper Component */}
          <ProductDetailsWrapper 
            product={productData} 
            variants={variants || []} 
          />
       </div>
    </div>
  )
}