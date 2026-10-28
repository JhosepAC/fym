"use client";
import Link from "next/link";
import type { MediaItem } from "@/lib/api";
import { mediaHref, mediaTitle, mediaYear, MOVIE_GENRES } from "@/lib/media";
import MediaImage from "./MediaImage";
import { SaveButton } from "./LibraryProvider";
import Icon from "./Icon";
export default function HeroBanner({
  items,
  currentIndex,
  onIndexChange,
}: {
  items: MediaItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}) {
  const item = items[currentIndex];
  if (!item)
    return (
      <div className="empty-state">
        <h2>La próxima historia está por llegar</h2>
        <p>Consulta el catálogo de películas para encontrar qué ver.</p>
        <Link href="/movies" className="button button-primary">
          Explorar películas
        </Link>
      </div>
    );
  return (
    <article className="feature">
      <div className="feature-copy" key={item.id}>
        <div className="feature-meta">
          <span className="rating">
            <Icon name="star" size={15} />
            {item.vote_count > 0 ? item.vote_average.toFixed(1) : "Sin votos"}
          </span>
          <span>{mediaYear(item)}</span>
          <span>
            {MOVIE_GENRES.find((g) => item.genre_ids?.includes(g.id))?.name ||
              "Película"}
          </span>
        </div>
        <h2>{mediaTitle(item)}</h2>
        <p className="feature-overview">
          {item.overview ||
            "Descubre los detalles de esta película y decide si será tu próxima sesión."}
        </p>
        <div className="button-row">
          <Link href={mediaHref(item)} className="button button-primary">
            Ver película <Icon name="arrow" size={16} />
          </Link>
          <SaveButton item={item} />
        </div>
        <div className="feature-pagination">
          <span>En el foco</span>
          <div>
            {items.map((movie, index) => (
              <button
                key={movie.id}
                className={index === currentIndex ? "is-current" : ""}
                onClick={() => onIndexChange(index)}
                aria-label={`Mostrar ${mediaTitle(movie)}`}
                aria-pressed={index === currentIndex}
              >
                <span />
              </button>
            ))}
          </div>
          <span>
            {currentIndex + 1} / {items.length}
          </span>
        </div>
      </div>
      <Link
        className="feature-art"
        href={mediaHref(item)}
        aria-label={`Ver ${mediaTitle(item)}`}
      >
        <MediaImage
          key={item.id}
          path={item.backdrop_path || item.poster_path}
          alt={`Fotograma de ${mediaTitle(item)}`}
          sizes="(max-width: 700px) 100vw, 650px"
          backdrop
          priority
        />
      </Link>
    </article>
  );
}
