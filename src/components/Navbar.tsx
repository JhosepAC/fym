"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import Logo from "./Logo";
import { useLibrary } from "./LibraryProvider";
interface NavbarProps {
  onSearch?: (query: string) => void;
  initialQuery?: string;
  transparent?: boolean;
}
export default function Navbar({ onSearch, initialQuery = "" }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const { entries, ready } = useLibrary();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        input.current?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        input.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (onSearch) onSearch(query.trim());
    else
      router.push(
        query.trim()
          ? `/search?q=${encodeURIComponent(query.trim())}`
          : "/search",
      );
    setOpen(false);
  }
  const links = [
    { href: "/", label: "Descubre" },
    { href: "/movies", label: "Películas" },
    { href: "/series", label: "Series" },
    { href: "/decide", label: "Elige por mí" },
  ];
  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link className="brand" href="/" aria-label="FyM, inicio">
          <Logo />
        </Link>
        <nav className="desktop-nav" aria-label="Navegación principal">
          {links.map((link) => (
            <Link
              key={link.href}
              className={link.href === "/decide" ? "nav-decide" : undefined}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.href === "/decide" && <Icon name="shuffle" size={16} />}
              {link.label}
            </Link>
          ))}
        </nav>
        <form className="nav-search" onSubmit={submit} role="search">
          <Icon name="search" />
          <label className="sr-only" htmlFor="global-search">
            Buscar películas y series
          </label>
          <input
            ref={input}
            id="global-search"
            placeholder="Encuentra tu próxima historia"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
          />
          <kbd>Ctrl K</kbd>
        </form>
        <Link
          className="library-link"
          href="/watchlist"
          aria-label="Mi lista"
          aria-current={pathname === "/watchlist" ? "page" : undefined}
        >
          <Icon name="bookmark" />
          <span>Mi lista</span>
          {ready && entries.length > 0 && (
            <span className="count">{entries.length}</span>
          )}
        </Link>
        <button
          className="icon-button mobile-menu-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          className="mobile-navigation"
          aria-label="Navegación móvil"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              className={link.href === "/decide" ? "nav-decide" : undefined}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/search" onClick={() => setOpen(false)}>
            Buscar
          </Link>
        </nav>
      )}
    </header>
  );
}
