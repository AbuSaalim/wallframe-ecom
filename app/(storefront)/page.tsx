import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import FeaturedSection from '@/components/Application/Website/FeaturedSection'

/**
 * HomePage
 * 
 * Includes:
 * - Hero Section (Static)
 * - Featured Products (Dynamic via React Query)
 * - Heritage/Trust Section (Static)
 */

export default function Home() {
  return (
    <div className="flex flex-col gap-0 pb-16 bg-white">
      
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1583391733975-62d3707b58b5?q=80&w=2574&auto=format&fit=crop"
            alt="Premium Ethnic Wear Model"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto flex flex-col items-center animate-in fade-in zoom-in duration-1000">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 tracking-tight drop-shadow-lg">
            Elegance Redefined
          </h1>
          <p className="text-lg md:text-xl mb-8 font-light tracking-wide drop-shadow-md max-w-2xl mx-auto opacity-90">
            Discover the finest collection of handcrafted ethnic wear, 
            inspired by the royal heritage of House of Kari.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default" size="lg" className="bg-white text-black hover:bg-white/90 text-base px-10 py-7 rounded-full font-medium transition-transform active:scale-95 shadow-xl border border-white">
              <Link href="/shop">Explore Collection</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products (Dynamic) */}
      <FeaturedSection />

      {/* Trust/Brand Story Section */}
      <section className="bg-gray-50 py-20 lg:py-32">
        <div className="px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 relative aspect-square w-full max-w-md rounded-full overflow-hidden border-8 border-white shadow-2xl mx-auto md:mx-0">
             <Image
                src="https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=2574&auto=format&fit=crop"
                alt="Brand Story"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
          </div>
          <div className="flex-1 text-center md:text-left space-y-6">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900">
              Our Heritage
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto md:mx-0" />
            <p className="text-gray-600 text-lg leading-relaxed font-light">
              Inspired by the timeless elegance of royal courts, Rafey brings you ethnic wear that transcends trends. 
              Each piece is a masterpiece, crafted by skilled artisans who have perfected their trade over generations.
              We believe in sustainable luxury that honors tradition.
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
