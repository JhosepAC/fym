"use client";

import { useRef, useState, useEffect } from "react";
import MovieCard from "./MovieCard";
import { MediaItem } from "@/lib/api/client";

interface MovieRowProps {
  title: string;
  items: MediaItem[];
  autoScrollInterval?: number;
}

export default function MovieRow({ title, items, autoScrollInterval = 5000 }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const CARD_WIDTH = 176;
  const CARD_GAP = 16;

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = CARD_WIDTH + CARD_GAP;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount * 3 : scrollAmount * 3,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    checkScroll();
    scrollContainer.addEventListener("scroll", checkScroll);
    return () => scrollContainer.removeEventListener("scroll", checkScroll);
  }, []);

  useEffect(() => {
    if (autoScrollInterval <= 0 || isHovered) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: CARD_WIDTH + CARD_GAP, behavior: "smooth" });
      }
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [autoScrollInterval, isHovered]);

  if (items.length === 0) return null;

  return (
    <section className="relative group">
      <h2 className="text-xl font-semibold text-white mb-4 px-8">{title}</h2>
      
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={() => scroll("left")}
          className={`absolute left-0 top-0 bottom-12 z-20 w-12 bg-black/70 hover:bg-black/90 flex items-center justify-center transition-all ${
            canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => scroll("right")}
          className={`absolute right-0 top-0 bottom-12 z-20 w-12 bg-black/70 hover:bg-black/90 flex items-center justify-center transition-all ${
            canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto px-8 pb-4 scrollbar-hide scroll-smooth"
        >
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-44">
              <MovieCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
