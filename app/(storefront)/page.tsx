import { Button } from '@/components/ui/button'
import Link from 'next/link'
import FeaturedSection from '@/components/Application/Website/FeaturedSection'
import HeroSlider from '@/components/Application/Website/HeroSlider' 

export default function Home() {
  return (
    <div className="flex flex-col gap-0 pb-16 bg-white">
      
      {/* 1. Dynamic Hero Slider */}
      <HeroSlider />

      {/* 2. Featured Products (Dynamic via React Query / API) */}
      <FeaturedSection />

      {/* 3. Trust/Brand Story Section */}
      <section className="bg-gray-50 py-20 lg:py-32">
        <div className="px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Side: Graphic/Icon */}
          <div className="flex-1 relative aspect-square w-full max-w-md rounded-full overflow-hidden border-8 border-white shadow-2xl mx-auto md:mx-0 bg-gradient-to-br from-primary/20 to-primary/5">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">✨</div>
                <p className="text-gray-600 font-serif text-lg">Premium Fashion & Lifestyle</p>
              </div>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="flex-1 text-center md:text-left space-y-6">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900">
              Our Heritage
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto md:mx-0" />
            <p className="text-gray-600 text-lg leading-relaxed font-light">
              Inspired by timeless elegance, we bring you products that transcend trends. 
              Each piece in our collection is thoughtfully curated, crafted with attention to detail and unmatched quality.
              We believe in delivering fashion and lifestyle products that bring beauty and confidence to your everyday life.
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