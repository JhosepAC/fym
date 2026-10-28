"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import LoadingGrid from "@/components/LoadingGrid";
import Icon from "@/components/Icon";
import { useLibrary } from "@/components/LibraryProvider";
import { mediaKey, mediaTitle, mediaType } from "@/lib/media";
export default function WatchlistPage() {
  const { entries, ready, remove, setStatus } = useLibrary();
  const [tab, setTab] = useState("pending");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [sort, setSort] = useState("recent");
  const pending = entries.filter((e) => e.status === "pending").length;
  const watched = entries.length - pending;
  const shown = entries
    .filter(
      (e) =>
        (tab === "all" || e.status === tab) &&
        (kind === "all" || mediaType(e.item) === kind) &&
        mediaTitle(e.item)
          .toLocaleLowerCase("es")
          .includes(query.toLocaleLowerCase("es")),
    )
    .sort((a, b) =>
      sort === "rating"
        ? b.item.vote_average - a.item.vote_average
        : sort === "title"
          ? mediaTitle(a.item).localeCompare(mediaTitle(b.item), "es")
          : b.addedAt.localeCompare(a.addedAt),
    );
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container">
        <div className="page-heading">
          <div>
            <h1>Mi lista</h1>
            <p>Las historias que quieres ver. Las que ya se quedan contigo.</p>
          </div>
          <Link href="/movies" className="button button-secondary">
            <Icon name="plus" size={16} />
            Explorar
          </Link>
        </div>
        <div className="library-summary">
          <span>
            <strong>{pending}</strong>Pendientes
          </span>
          <span>
            <strong>{watched}</strong>Vistas
          </span>
          <span>
            <strong>{entries.length}</strong>En total
          </span>
        </div>
        <div
          role="group"
          aria-label="Estado en mi lista"
          className="catalog-tabs"
        >
          {[
            { id: "pending", label: "Por ver" },
            { id: "watched", label: "Ya vistas" },
            { id: "all", label: "Toda mi lista" },
          ].map((t) => (
            <button
              key={t.id}

              aria-pressed={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {!ready ? (
          <LoadingGrid />
        ) : !entries.length ? (
          <div className="empty-state">
            <h2>Tu próxima sesión empieza aquí</h2>
            <p>
              Guarda películas y series con el botón de añadir. Tu lista queda
              en este navegador, sin necesidad de una cuenta.
            </p>
            <Link href="/" className="button button-primary">
              Descubrir historias <Icon name="arrow" size={16} />
            </Link>
          </div>
        ) : (
          <>
            <div className="filter-bar">
              <div className="filter-field">
                <label htmlFor="library-search">Buscar en mi lista</label>
                <input
                  id="library-search"
                  placeholder="Título de película o serie"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="filter-field">
                <label htmlFor="library-kind">Tipo</label>
                <select
                  id="library-kind"
                  value={kind}
                  onChange={(e) => setKind(e.target.value)}
                >
                  <option value="all">Películas y series</option>
                  <option value="movie">Películas</option>
                  <option value="tv">Series</option>
                </select>
              </div>
              <div className="filter-field">
                <label htmlFor="library-sort">Ordenar por</label>
                <select
                  id="library-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="recent">Añadidas recientemente</option>
                  <option value="rating">Valoración</option>
                  <option value="title">Título</option>
                </select>
              </div>
            </div>
            <div className="results-meta">
              <span>{shown.length} títulos en esta vista</span>
              <span>Guardada en este navegador</span>
            </div>
            {shown.length ? (
              <div className="media-grid">
                {shown.map((entry) => (
                  <div key={mediaKey(entry.item)}>
                    <MovieCard item={entry.item} />
                    <div className="library-card-actions">
                      <button
                        className="text-link"
                        onClick={() =>
                          setStatus(
                            entry.item,
                            entry.status === "pending" ? "watched" : "pending",
                          )
                        }
                      >
                        <Icon
                          name={
                            entry.status === "pending" ? "check" : "bookmark"
                          }
                          size={14}
                        />
                        {entry.status === "pending"
                          ? "Marcar vista"
                          : "Por ver"}
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => remove(entry.item)}
                        aria-label={`Quitar ${mediaTitle(entry.item)} de mi lista`}
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h2>No hay títulos en esta vista</h2>
                <p>
                  Cambia los filtros o guarda más historias para tu próxima
                  sesión.
                </p>
                <button
                  className="button button-secondary"
                  onClick={() => {
                    setTab("all");
                    setKind("all");
                    setQuery("");
                  }}
                >
                  Ver toda mi lista
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
