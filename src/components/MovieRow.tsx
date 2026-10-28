"use client";
import { useRef } from "react";
import Link from "next/link";
import type { MediaItem } from "@/lib/api";
import MovieCard from "./MovieCard";
import Icon from "./Icon";
import { mediaKey } from "@/lib/media";
export default function MovieRow({
  title,
  items,
  href,
  description,
}: {
  title: string;
  items: MediaItem[];
  href?: string;
  description?: string;
  autoScrollInterval?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (direction: number) =>
    ref.current?.scrollBy({
      left: direction * ref.current.clientWidth * 0.8,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  return (
    <section className="movie-section" aria-label={title}>
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <div className="row-actions">
          {href && (
            <Link href={href} className="text-link">
              Ver todas <Icon name="arrow" size={16} />
            </Link>
          )}
          <div className="row-arrows">
            <button
              className="icon-button"
              onClick={() => scroll(-1)}
              aria-label={`Anterior en ${title}`}
            >
              <Icon name="left" />
            </button>
            <button
              className="icon-button"
              onClick={() => scroll(1)}
              aria-label={`Siguiente en ${title}`}
            >
              <Icon name="right" />
            </button>
          </div>
        </div>
      </div>
      {items.length ? (
        <div className="movie-rail" ref={ref}>
          {items.map((item) => (
            <MovieCard key={mediaKey(item)} item={item} />
          ))}
        </div>
      ) : (
        <p className="inline-empty">
          No hay títulos disponibles en esta selección.
        </p>
      )}
    </section>
  );
}
