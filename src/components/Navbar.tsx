"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef } from "react";

interface NavbarProps {
  onSearch?: (query: string) => void;
  initialQuery?: string;
  transparent?: boolean;
}

export default function Navbar({ onSearch, initialQuery = "", transparent = true }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
      setIsMobileSearchOpen(false);
    }
  };

  const handleMobileSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
      setIsMobileSearchOpen(false);
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
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-3 backdrop-blur-md bg-black/40 border-b border-white/5 transition-colors ${
        transparent ? "" : "bg-[#1A1A1B]/95"
      }`}
    >
      <div className="flex items-center gap-4 md:gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/assets/favicon/favicon-light.svg"
            alt="FyM Logo"
            className="w-8 md:w-10 h-8 md:h-10 transition-transform duration-300 group-hover:scale-110"
          />
          <span className="text-2xl md:text-3xl font-normal text-red-600 transition-all duration-300 group-hover:text-red-500 group-hover:drop-shadow-[0_0_12px_rgba(220,38,38,0.6)]" style={{ fontFamily: "var(--font-rubik-glitch), system-ui" }}>
            FyM
          </span>
        </Link>
        <ul className="hidden md:flex items-center gap-1">
          {[
            { href: "/", label: "Home" },
            { href: "/movies", label: "Movies" },
            { href: "/series", label: "Series" },
          ].map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive ? "text-red-500" : "text-gray-300 hover:text-white"
                  } before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-0 before:h-0.5 before:bg-red-600 before:transition-all before:duration-300 ${
                    isActive ? "before:w-full" : "hover:before:w-full"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <form onSubmit={handleSearch} className="relative group hidden md:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400 group-focus-within:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Search titles..."
            className={`w-56 bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm ${
              isSearchFocused || searchQuery ? "w-72 bg-white/10" : "hover:bg-white/5 hover:border-white/20"
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </form>

        <button
          type="button"
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
        >
          {isMobileSearchOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </div>

      {isMobileSearchOpen && (
        <div className="absolute top-full left-0 right-0 p-4 md:hidden bg-[#1A1A1B]/95 backdrop-blur-md border-b border-white/5">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleMobileSearch}
              placeholder="Search titles..."
              autoFocus
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-11 pr-10 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
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
      )}
    </nav>
  );
}
