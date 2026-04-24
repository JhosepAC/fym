"use client";

import { useRef, useState, useEffect } from "react";
import MovieCard from "./MovieCard";
import { MediaItem } from "@/lib/api/client";

interface MovieRowProps {
  title: string;
  items: MediaItem[];
  autoScrollInterval?: number;
}

export default function MovieRow({ title, items, autoScrollInterval = 4000 }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const CARD_WIDTH = 192;
  const CARD_GAP = 20;

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current || isTransitioning) return;
    
    setIsTransitioning(true);
    const scrollAmount = (CARD_WIDTH + CARD_GAP) * 4;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    
    setTimeout(() => setIsTransitioning(false), 600);
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    checkScroll();
    scrollContainer.addEventListener("scroll", checkScroll);
    return () => scrollContainer.removeEventListener("scroll", checkScroll);
  }, []);

  useEffect(() => {
    if (autoScrollInterval <= 0 || isHovered || isTransitioning) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      
      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: CARD_WIDTH + CARD_GAP, behavior: "smooth" });
      }
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [autoScrollInterval, isHovered, isTransitioning]);

  if (items.length === 0) return null;

  return (
    <section className="relative group py-4">
      <div className="flex items-center gap-4 mb-5 px-8">
        <h2 className="text-2xl font-bold text-white tracking-wide">{title}</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-red-600 to-transparent opacity-60" />
      </div>
      
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={() => scroll("left")}
          className={`absolute left-0 top-0 bottom-0 z-20 w-12 md:w-16 bg-gradient-to-r from-[#0a0a0b] via-[#0a0a0b]/70 to-transparent flex items-center justify-center transition-all duration-300 hover:bg-white/10 ${
            canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </button>

        <button
          onClick={() => scroll("right")}
          className={`absolute right-0 top-0 bottom-0 z-20 w-12 md:w-16 bg-gradient-to-l from-[#0a0a0b] via-[#0a0a0b]/70 to-transparent flex items-center justify-center transition-all duration-300 hover:bg-white/10 ${
            canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto px-8 pb-6 scrollbar-hide scroll-smooth"
          style={{ scrollBehavior: 'smooth' }}
        >
          {items.map((item, index) => (
            <div 
              key={`${item.id}-${index}`} 
              className="flex-shrink-0 w-48 transform group-hover:scale-105 transition-transform duration-300"
              style={{ 
                animation: !isHovered && index === 0 ? 'subtle-pulse 2s infinite' : 'none'
              }}
            >
              <MovieCard item={item} />
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      </div>

      <style jsx>{`
        @keyframes subtle-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </section>
  );
}