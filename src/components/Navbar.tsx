"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

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
            <Link href="/search" className="text-gray-400 hover:text-white transition-colors">
              Movies
            </Link>
          </li>
          <li>
            <Link href="/search" className="text-gray-400 hover:text-white transition-colors">
              TV Shows
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

        <button className="p-2 text-gray-300 hover:text-white transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
        </button>
        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white text-sm font-medium">
          U
        </div>
      </div>
    </nav>
  );
}
