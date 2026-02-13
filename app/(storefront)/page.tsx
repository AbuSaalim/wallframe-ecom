import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import FeaturedSection from '@/components/Application/Website/FeaturedSection'
import ProductSlider from '@/components/Application/Website/ProductSlider'

/**
 * HomePage
 * 
 * Includes:
 * - Hero Section (Static)
 * - Product Slider (Animated Islamic Wall Frames)
 * - Featured Products (Dynamic via React Query)
 * - Heritage/Trust Section (Static)
 */

export default function Home() {
  // Sample products for slider - in production, fetch from API
  const sliderProducts = [
    {
      _id: '1',
      name: 'Ayatul Kursi Wall Frame',
      slug: 'ayatul-kursi-wall-frame',
      description: 'Beautiful Islamic calligraphy',
      sellingPrice: 2999,
      mrp: 4999,
      discountPercentage: 40,
      media: [{ _id: '1', secure_url: '/placeholder.png', alt: 'Islamic Wall Frame', title: 'Frame 1' }],
      category: { _id: '1', name: 'Wall Frames', slug: 'wall-frames' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '2',
      name: 'Bismillah Calligraphy Frame',
      slug: 'bismillah-calligraphy-frame',
      description: 'Elegant Bismillah design',
      sellingPrice: 3499,
      mrp: 5999,
      discountPercentage: 42,
      media: [{ _id: '2', secure_url: '/placeholder.png', alt: 'Islamic Wall Frame', title: 'Frame 2' }],
      category: { _id: '1', name: 'Wall Frames', slug: 'wall-frames' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '3',
      name: 'Allah Muhammad Frame Set',
      slug: 'allah-muhammad-frame-set',
      description: 'Premium frame set',
      sellingPrice: 4999,
      mrp: 7999,
      discountPercentage: 38,
      media: [{ _id: '3', secure_url: '/placeholder.png', alt: 'Islamic Wall Frame', title: 'Frame 3' }],
      category: { _id: '1', name: 'Wall Frames', slug: 'wall-frames' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '4',
      name: 'Surah Al-Ikhlas Frame',
      slug: 'surah-al-ikhlas-frame',
      description: 'Beautiful Quranic verse',
      sellingPrice: 2799,
      mrp: 4499,
      discountPercentage: 38,
      media: [{ _id: '4', secure_url: '/placeholder.png', alt: 'Islamic Wall Frame', title: 'Frame 4' }],
      category: { _id: '1', name: 'Wall Frames', slug: 'wall-frames' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  return (
    <div className="flex flex-col gap-0 pb-16 bg-white">
      
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto flex flex-col items-center animate-in fade-in zoom-in duration-1000">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 tracking-tight drop-shadow-lg">
            Elegance Redefined
          </h1>
          <p className="text-lg md:text-xl mb-8 font-light tracking-wide drop-shadow-md max-w-2xl mx-auto opacity-90">
            Discover the finest collection of handcrafted Islamic wall frames, 
            inspired by timeless elegance and spiritual beauty.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default" size="lg" className="bg-white text-black hover:bg-white/90 text-base px-10 py-7 rounded-full font-medium transition-transform active:scale-95 shadow-xl border border-white">
              <Link href="/shop">Explore Collection</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Islamic Wall Frames Slider */}
      <ProductSlider products={sliderProducts} />

      {/* Featured Products (Dynamic) */}
      <FeaturedSection />

      {/* Trust/Brand Story Section */}
      <section className="bg-gray-50 py-20 lg:py-32">
        <div className="px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 relative aspect-square w-full max-w-md rounded-full overflow-hidden border-8 border-white shadow-2xl mx-auto md:mx-0 bg-gradient-to-br from-primary/20 to-primary/5">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🕌</div>
                <p className="text-gray-600 font-serif text-lg">Islamic Art & Calligraphy</p>
              </div>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left space-y-6">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900">
              Our Heritage
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto md:mx-0" />
            <p className="text-gray-600 text-lg leading-relaxed font-light">
              Inspired by the timeless elegance of Islamic art, Rafey brings you wall frames that transcend trends. 
              Each piece is a masterpiece, crafted with attention to detail and spiritual significance.
              We believe in creating art that honors tradition while bringing beauty to modern homes.
            </p>
            <div className="pt-4">
              <Button asChild variant="outline" size="lg" className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors uppercase tracking-widest text-xs h-14 px-10 rounded-full">
                <Link href="/about">Read Our Story</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
