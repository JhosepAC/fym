"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

interface NavbarProps {
  onSearch?: (query: string) => void;
  initialQuery?: string;
  transparent?: boolean;
}

export default function Navbar({ onSearch, initialQuery = "", transparent = true }: NavbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !onSearch) {
      handleSearch(e as unknown as React.FormEvent);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    inputRef.current?.focus();
    if (onSearch) {
      onSearch("");
    } else {
      router.push("/search");
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 transition-colors ${
        transparent ? "bg-gradient-to-b from-black/90 to-transparent" : "bg-[#1A1A1B]"
      }`}
    >
      <div className="flex items-center gap-8">
        <Link href="/" className="text-2xl font-bold text-red-600">
          FYM
        </Link>
        <ul className="hidden md:flex items-center gap-6 text-sm">
          <li>
            <Link href="/" className="text-white hover:text-gray-300 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link href="/movies" className="text-gray-400 hover:text-white transition-colors">
              Movies
            </Link>
          </li>
          <li>
            <Link href="/series" className="text-gray-400 hover:text-white transition-colors">
              Series
            </Link>
          </li>
        </ul>
      </div>

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Search titles"
            className={`bg-transparent border rounded px-4 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none transition-all ${
              isSearchFocused || searchQuery ? "w-64 border-white/60" : "w-40 border-white/30"
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </form>
      </div>
    </nav>
  );
}
