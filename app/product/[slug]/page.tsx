import React from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import axios from 'axios'
import ProductDetailsWrapper from '@/components/Application/Website/ProductDetailsWrapper'
import { Product, ProductVariant } from '@/types/product'

interface ProductPageProps {
  params: {
    slug: string
  }
}

// Fetch Logic
async function getProduct(slug: string) {
  try {
    // Determine the base URL. In Server Components, relative URLs might fail for axios if no base URL.
    // However, since we are in the same Next.js app, we can call the DB directly or use absolute URL.
    // Using absolute URL with process.env.NEXT_PUBLIC_APP_URL or http://localhost:3000
    // But direct DB call is better for Server Components to avoid self-request overhead.
    // BUT the implementation plan said "Public API: ... fetch product".
    // User often prefers API consistency. I will try to fetch from API using absolute URL if possible.
    // Or I'll allow the API handler logic to be imported? No, route handlers are Request/Response.
    
    // Let's use internal fetch to our own API for consistency with plan, but need domain.
    // Fallback: DB Call directly is robust. 
    // Plan: "frontend fetches data from API". Since `page.tsx` is server component, it acts as frontend server-side.
    // I will use `axios` with a base URL if available, or just assume localhost for dev.
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const { data } = await axios.get(`${baseUrl}/api/public/products/${slug}`)
    
    if (data.success) {
        return data.data as (Product & { variants: ProductVariant[] }) // API returns combined object
    }
    return null
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

  // API returns combined object where product fields are top level and variants is a property
  // ProductDetailsWrapper expects separate product and variants props
  // We can pass productData as product (it matches Product interface + variants)
  // and explicit variants prop.
  
  // Clean up: Extract variants to separate array to match types strictly if needed, 
  // but Product interface now has optional `variants`.
  
  const { variants, ...productOnly } = productData
  // We need to cast productData back to Product structure carefully if we removed variants, 
  // but actually ProductDetailsWrapper takes `product` and `variants`.
  // `productData` has everything.
  
  return (
    <div className="bg-white min-h-screen pb-20">
       {/* Breadcrumb could go here */}
       <div className="container px-4 md:px-6 lg:px-12 py-8 mx-auto">
          {/* Back link etc? handled in layout/nav usually or add here */}
          
          <ProductDetailsWrapper 
            product={productData} 
            variants={variants || []} 
          />
       </div>
    </div>
  )
}
