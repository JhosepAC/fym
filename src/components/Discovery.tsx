"use client";
import Link from "next/link";
import type { MediaItem } from "@/lib/api";
import HeroBannerWrapper from "./HeroBannerWrapper";
import MovieRow from "./MovieRow";
import MediaImage from "./MediaImage";
import Icon from "./Icon";
import { mediaHref, mediaTitle, mediaYear } from "@/lib/media";
export default function Discovery({
  trending,
  popular,
  topRated,
  series,
}: {
  trending: MediaItem[];
  popular: MediaItem[];
  topRated: MediaItem[];
  series: MediaItem[];
}) {
  const surpriseControl = (
    <div className="surprise">
      <div>
        <Icon name="shuffle" />
        <h3>¿No te decides?</h3>
      </div>
      <p>Prepara tu selección y deja que la ruleta elija la película.</p>
      <div className="button-row">
        <Link className="text-link" href="/decide">
          Elige por mí
          <Icon name="arrow" size={15} />
        </Link>
      </div>
    </div>
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Descubre</h1>
          <p>Menos buscar. Más buenas historias.</p>
        </div>
        <Link className="text-link" href="/watchlist">
          <Icon name="bookmark" size={16} /> Tu próxima sesión, a mano
        </Link>
      </div>
      <nav className="genre-rail" aria-label="Explorar por género">
        <Link className="genre-active" href="/">
          Para ti
        </Link>
        {[
          { id: 28, label: "Acción" },
          { id: 35, label: "Comedia" },
          { id: 18, label: "Drama" },
          { id: 878, label: "Ciencia ficción" },
          { id: 53, label: "Suspense" },
          { id: 16, label: "Animación" },
          { id: 27, label: "Terror" },
          { id: 10749, label: "Romance" },
        ].map((g) => (
          <Link href={`/movies?genre=${g.id}`} key={g.id}>
            {g.label}
          </Link>
        ))}
      </nav>
      <div className="discovery-lead">
        <HeroBannerWrapper items={trending.slice(0, 5)} />
        <aside className="radar">
          <div className="section-heading">
            <h2>En tu radar</h2>
            <span className="muted">Muy bien valoradas</span>
          </div>
          <div className="radar-list">
            {topRated.slice(0, 3).map((item) => (
              <Link key={item.id} href={mediaHref(item)} className="radar-item">
                <div className="radar-poster">
                  <MediaImage
                    path={item.poster_path}
                    alt={mediaTitle(item)}
                    sizes="65px"
                  />
                </div>
                <div>
                  <h3>{mediaTitle(item)}</h3>
                  <p>
                    {mediaYear(item)}
                    <span className="meta-dot" />
                    <span className="rating">
                      <Icon name="star" size={12} />
                      {item.vote_average.toFixed(1)}
                    </span>
                  </p>
                </div>
                <Icon name="right" size={15} />
              </Link>
            ))}
          </div>
          {surpriseControl}
        </aside>
      </div>
      <div className="mobile-surprise">{surpriseControl}</div>
      <MovieRow
        title="De las que todos hablan"
        description="Las películas en tendencia esta semana."
        items={trending.slice(0, 14)}
        href="/movies?category=trending"
      />
      <MovieRow
        title="Un episodio más"
        description="Series que merecen un hueco en tu lista."
        items={series.slice(0, 14)}
        href="/series"
      />
      <MovieRow
        title="Encuentra tu favorita"
        description="Lo más popular del catálogo, para seguir explorando."
        items={popular.slice(0, 14)}
        href="/movies"
      />
    </>
  );
}
