"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Aapki images aur content ka data
  const slides = [
    {
      id: 1,
      image: "/assets/images/slider-1.png", // Aapke folder wali image
      title: "Elegance Redefined",
      subtitle: "Discover the finest collection of handcrafted Islamic wall frames, inspired by timeless elegance.",
      buttonText: "Explore Collection",
      link: "/shop",
    },
    {
      id: 2,
      image: "/assets/images/slider-2.png",
      title: "Spiritual Beauty",
      subtitle: "Transform your home with our premium, carefully crafted calligraphy pieces.",
      buttonText: "Shop Wall Frames",
      link: "/shop",
    },
    {
      id: 3,
      image: "/assets/images/slider-3.png",
      title: "Modern Islamic Art",
      subtitle: "A perfect blend of traditional heritage and modern aesthetics for your living space.",
      buttonText: "View Best Sellers",
      link: "/shop",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Auto-play logic (har 5 second mein slide change hogi)
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-gray-900 group">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image */}
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={index === 0}
            className="object-cover opacity-60 transition-transform duration-[10000ms] ease-linear scale-105"
            style={{
              transform: index === currentSlide ? "scale(1.1)" : "scale(1)",
            }}
          />
          
          {/* Gradient Overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />

          {/* Text Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 max-w-4xl mx-auto">
            <h1
              className={`text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 tracking-tight drop-shadow-lg transition-all duration-1000 delay-300 ${
                index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              {slide.title}
            </h1>
            <p
              className={`text-lg md:text-xl mb-8 font-light tracking-wide drop-shadow-md max-w-2xl mx-auto opacity-90 transition-all duration-1000 delay-500 ${
                index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              {slide.subtitle}
            </p>
            <div
              className={`transition-all duration-1000 delay-700 ${
                index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <Button asChild variant="default" size="lg" className="bg-white text-black hover:bg-white/90 text-base px-10 py-7 rounded-full font-medium transition-transform active:scale-95 shadow-xl border border-white">
                <Link href={slide.link}>{slide.buttonText}</Link>
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows (dikhengi sirf jab mouse hover hoga) */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-8" : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}