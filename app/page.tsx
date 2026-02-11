import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

/**
 * HomePage
 * 
 * CLEAN EXAMPLE:
 * - This page does NOT import or render <Footer />.
 * - The Footer is automatically provided by the RootLayout (app/layout.tsx).
 * - Focus on content sections only.
 */

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] bg-gray-50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1583391733975-62d3707b58b5?q=80&w=2574&auto=format&fit=crop"
            alt="Premium Ethnic Wear Model"
            fill
            className="object-cover opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 tracking-tight drop-shadow-md">
            Elegance Redefined
          </h1>
          <p className="text-lg md:text-xl mb-8 font-light tracking-wide drop-shadow-sm max-w-2xl mx-auto">
            Discover the finest collection of handcrafted ethnic wear, 
            inspired by the royal heritage of House of Kari.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white/90 text-black hover:bg-white text-base px-8 py-6 rounded-full font-medium transition-transform active:scale-95">
              Explore Collection
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 text-base px-8 py-6 rounded-full font-medium transition-transform active:scale-95">
              View Lookbook
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Categories (Example Content) */}
      <section className="px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold mb-4 text-foreground">Curated Collections</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Explore our handpicked selections designed for the modern woman who values tradition.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Royal Silks', image: 'https://images.unsplash.com/photo-1610030469983-98e55041d04f?q=80&w=2600&auto=format&fit=crop' },
            { title: 'Festive Kurtas', image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=2534&auto=format&fit=crop' },
            { title: 'Modern Fusion', image: 'https://images.unsplash.com/photo-1601055283134-297f62e8736a?q=80&w=2670&auto=format&fit=crop' }
          ].map((item, index) => (
            <div key={index} className="group relative aspect-[3/4] overflow-hidden rounded-lg cursor-pointer">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-serif font-medium mb-2">{item.title}</h3>
                <span className="text-sm uppercase tracking-widest border-b border-white pb-1 group-hover:border-primary transition-colors">Shop Now</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust/Brand Story Section */}
      <section className="bg-gray-50 py-20">
        <div className="px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 relative aspect-square w-full max-w-md rounded-full overflow-hidden border-8 border-white shadow-xl mx-auto md:mx-0">
             <Image
                src="https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=2574&auto=format&fit=crop"
                alt="Brand Story"
                fill
                className="object-cover"
              />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-foreground">Our Heritage</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Inspired by the timeless elegance of royal courts, Rafey brings you ethnic wear that transcends trends. 
              Each piece is a masterpiece, crafted by skilled artisans who have perfected their trade over generations.
            </p>
            <Button size="lg" variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground hover:text-white transition-colors uppercase tracking-widest text-xs h-12 px-8">
              Read Our Story
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
