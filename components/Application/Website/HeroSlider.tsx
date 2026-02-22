"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; 

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sirf images aur unke links ka data
  const slides = [
    {
      id: 1,
      image: "/assets/images/slider-5.jpg",
      alt: "Premium Men Collection",
      link: "/shop",
    },
    {
      id: 2,
      image: "/assets/images/slider-6.jpg",
      alt: "Ethnic Wear Collection",
      link: "/shop", 
    },
    {
      id: 3,
      image: "/assets/images/slider-7.jpg",
      alt: "Accessories Sale",
      link: "/shop", 
    },
  ];

  // Auto-play logic (har 2 second mein slide change hogi)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 2000); // 2000 ms = exact 2 seconds

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    // Responsive Height: Mobile pe 50vh, Tablet pe 70vh, aur Desktop pe 85vh
    <section className="relative w-full h-[50vh] md:h-[70vh] lg:h-[85vh] flex items-center justify-center overflow-hidden bg-gray-900">
      
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <Link href={slide.link} className="block w-full h-full">
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={index === 0}
              className="object-cover transition-transform duration-[10000ms] ease-linear scale-105 cursor-pointer"
              style={{
                transform: index === currentSlide ? "scale(1.1)" : "scale(1)",
              }}
            />
          </Link>
        </div>
      ))}

      {/* Premium & Attractive Dots Indicator */}
      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${
              index === currentSlide 
                ? "w-10 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" // Active: Lamba aur Glowing
                : "w-2.5 bg-white/40 hover:bg-white/80 hover:w-5" // Inactive: Chota, hover pe thoda bada hoga
            }`}
          />
        ))}
      </div>
      
    </section>
  );
}