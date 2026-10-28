"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_PREFERENCES,
  MAX_WHEEL_SIZE,
  WHEEL_STORAGE_KEY,
  parseWheel,
  toDecisionMovie,
  validatePreferences,
  type DecisionMovie,
  type DecisionPreferences,
  type DecisionSelection,
  type PersonOption,
} from "@/lib/decision";
import { MOVIE_GENRES } from "@/lib/media";
import { apiClient } from "@/lib/api";
import { useLibrary } from "../LibraryProvider";
import MediaImage from "../MediaImage";
import Icon from "../Icon";
import MovieWheel from "./MovieWheel";
import ActorPicker from "./ActorPicker";

export default function DecisionStudio({
  initial,
  initialFailed,
}: {
  initial: DecisionSelection;
  initialFailed: boolean;
}) {
  const [mode, setMode] = useState<"discover" | "custom">("discover");
  const [preferences, setPreferences] = useState<DecisionPreferences>({
    ...DEFAULT_PREFERENCES,
  });
  const [people, setPeople] = useState<PersonOption[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selection, setSelection] = useState(initial);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(
    initialFailed
      ? "No se pudo cargar la selección inicial. Puedes intentarlo de nuevo."
      : "",
  );
  const [wheel, setWheel] = useState<DecisionMovie[]>([]);
  const [ready, setReady] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [notice, setNotice] = useState("");
  const { entries, ready: libraryReady } = useLibrary();
  const [query, setQuery] = useState("");
  const [searchData, setSearchData] = useState<{
    movies: DecisionMovie[];
    page: number;
    pages: number;
  }>({ movies: [], page: 0, pages: 0 });
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [loadedQuery, setLoadedQuery] = useState("");
  const searchGeneration = useRef(0);
  const selectionGeneration = useRef(0);
  useEffect(() => {
    function read() {
      try {
        setWheel(parseWheel(localStorage.getItem(WHEEL_STORAGE_KEY)));
      } catch {
        setNotice("No pudimos recuperar tu ruleta. Puedes crear una nueva.");
      }
      setReady(true);
    }
    read();
  }, []);
  useEffect(
    () => () => {
      selectionGeneration.current++;
      searchGeneration.current++;
    },
    [],
  );
  function commitWheel(next: DecisionMovie[], message: string) {
    if (spinning || !ready) return;
    try {
      localStorage.setItem(WHEEL_STORAGE_KEY, JSON.stringify(next));
      setWheel(next);
      setNotice(message);
    } catch {
      setNotice(
        "No se pudo guardar la ruleta. Revisa los permisos y el espacio del navegador.",
      );
    }
  }
  function toggleMovie(movie: DecisionMovie) {
    if (wheel.some((item) => item.id === movie.id)) {
      commitWheel(
        wheel.filter((item) => item.id !== movie.id),
        `${movie.title} salió de la ruleta.`,
      );
      return;
    }
    if (wheel.length >= MAX_WHEEL_SIZE) {
      setNotice(
        "La ruleta admite hasta 12 películas. Quita una antes de añadir otra.",
      );
      return;
    }
    commitWheel([...wheel, movie], `${movie.title} se añadió a la ruleta.`);
  }
  function replaceWheel(movies: DecisionMovie[]) {
    const unique = [
      ...new Map(movies.map((movie) => [movie.id, movie])).values(),
    ].slice(0, MAX_WHEEL_SIZE);
    commitWheel(unique, `Ruleta preparada con ${unique.length} películas.`);
  }
  function update<K extends keyof DecisionPreferences>(
    key: K,
    value: DecisionPreferences[K],
  ) {
    setPreferences((previous) => ({ ...previous, [key]: value }));
  }
  function changeQuery(value: string) {
    searchGeneration.current++;
    setSearching(false);
    setSearchError("");
    setQuery(value);
  }
  async function generate(event?: React.FormEvent) {
    event?.preventDefault();
    if (generating || spinning) return;
    const validated = validatePreferences({
      ...preferences,
      cast: people.map((person) => person.id),
    });
    if (!validated.ok) {
      setError(validated.error);
      return;
    }
    const request = ++selectionGeneration.current;
    setGenerating(true);
    setError("");
    try {
      const response = await fetch("/api/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated.value),
        signal: AbortSignal.timeout(25000),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "No pudimos preparar tu selección.");
      if (request !== selectionGeneration.current) return;
      setSelection(data);
      setNotice(
        data.movies.length
          ? `Nueva selección: ${data.movies.length} películas para comparar.`
          : "No encontramos películas con todas esas preferencias.",
      );
      setFiltersOpen(false);
    } catch (failure) {
      if (request === selectionGeneration.current)
        setError(
          failure instanceof Error
            ? failure.message
            : "No pudimos preparar tu selección. Inténtalo de nuevo.",
        );
    } finally {
      if (request === selectionGeneration.current) setGenerating(false);
    }
  }
  async function searchMovies(term: string, page = 1) {
    const request = ++searchGeneration.current;
    setSearching(true);
    setSearchError("");
    try {
      const result = await apiClient.searchMovies(term, page);
      if (request !== searchGeneration.current) return;
      const movies = result.results
        .map(toDecisionMovie)
        .filter((movie): movie is DecisionMovie => !!movie);
      setSearchData((previous) => ({
        movies: [
          ...new Map(
            (page === 1 ? movies : [...previous.movies, ...movies]).map(
              (movie) => [movie.id, movie],
            ),
          ).values(),
        ],
        page: result.page,
        pages: result.total_pages,
      }));
      setLoadedQuery(term);
    } catch {
      if (request === searchGeneration.current)
        setSearchError(
          "No se pudieron buscar las películas. Inténtalo de nuevo.",
        );
    } finally {
      if (request === searchGeneration.current) setSearching(false);
    }
  }
  useEffect(() => {
    if (mode !== "custom") return;
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) void searchMovies(query.trim());
    }, 350);
    return () => {
      clearTimeout(timer);
      // Invalidate a numeric generation, not a DOM ref.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      searchGeneration.current++;
    }; // numeric generation protects against stale responses
  }, [query, mode]);
  const pending = entries
    .filter((entry) => entry.status === "pending")
    .map((entry) => toDecisionMovie(entry.item))
    .filter((movie): movie is DecisionMovie => !!movie);
  const searchingForTitle = mode === "custom" && query.trim().length >= 2;
  const candidates =
    mode === "discover"
      ? selection.movies
      : searchingForTitle
        ? loadedQuery === query.trim()
          ? searchData.movies
          : []
        : initial.movies;
  const candidatesLoading =
    generating ||
    (searchingForTitle &&
      (searching || loadedQuery !== query.trim()) &&
      !searchError);
  const filterCount =
    preferences.genres.length +
    people.length +
    Number(!!preferences.yearFrom || !!preferences.yearTo) +
    Number(!!preferences.maxRuntime);
  return (
    <main id="main-content" className="page-container decision-page">
      <div className="page-heading decision-heading">
        <div>
          <h1>Elige por mí</h1>
          <p>Una buena película. Una decisión menos.</p>
        </div>
        <a href="#movie-wheel" className="button button-secondary">
          <Icon name="shuffle" size={16} />
          Ir a mi ruleta <span className="count">{wheel.length}</span>
        </a>
      </div>
      <div
        className="decision-mode-bar"
        role="group"
        aria-label="Cómo elegir tu película"
      >
        <button
          aria-pressed={mode === "discover"}
          disabled={spinning}
          onClick={() => setMode("discover")}
        >
          <Icon name="filter" size={16} />
          Descubrir películas
        </button>
        <button
          aria-pressed={mode === "custom"}
          disabled={spinning}
          onClick={() => setMode("custom")}
        >
          <Icon name="plus" size={16} />
          Crear mi ruleta
        </button>
        <span>Tu próxima sesión empieza aquí.</span>
      </div>
      <div
        className="decision-notice"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {notice ||
          "Elige las películas que entran en tu ruleta. Tú preparas la selección; el azar decide."}
      </div>
      <div
        className={`decision-workspace ${mode === "custom" ? "custom-mode" : ""}`}
      >
        <section
          className="decision-preferences"
          aria-labelledby="preferences-heading"
        >
          <div className="decision-section-heading">
            <div>
              <h2 id="preferences-heading">
                {mode === "discover" ? "Tus preferencias" : "A tu manera"}
              </h2>
              <p>
                {mode === "discover"
                  ? "Ajusta el plan de hoy."
                  : "Las candidatas las eliges tú."}
              </p>
            </div>
            <button
              className="icon-button decision-filter-toggle"
              aria-label={
                filtersOpen ? "Ocultar preferencias" : "Mostrar preferencias"
              }
              aria-expanded={filtersOpen}
              aria-controls="decision-filter-body"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <Icon name="filter" />
              {filterCount > 0 && <span className="count">{filterCount}</span>}
            </button>
          </div>
          {mode === "discover" ? (
            <form
              id="decision-filter-body"
              className={`decision-filter-body ${filtersOpen ? "is-open" : ""}`}
              onSubmit={generate}
            >
              <fieldset disabled={spinning || generating}>
                <legend>Géneros</legend>
                <p className="field-hint">Puedes elegir hasta 4.</p>
                <div className="decision-genres">
                  {MOVIE_GENRES.map((genre) => (
                    <button
                      type="button"
                      key={genre.id}
                      aria-pressed={preferences.genres.includes(genre.id)}
                      disabled={
                        !preferences.genres.includes(genre.id) &&
                        preferences.genres.length >= 4
                      }
                      onClick={() =>
                        update(
                          "genres",
                          preferences.genres.includes(genre.id)
                            ? preferences.genres.filter((id) => id !== genre.id)
                            : [...preferences.genres, genre.id],
                        )
                      }
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
                {preferences.genres.length > 1 && (
                  <label className="decision-field">
                    <span>Combinar géneros</span>
                    <select
                      value={preferences.genreMode}
                      onChange={(e) =>
                        update("genreMode", e.target.value as "any" | "all")
                      }
                    >
                      <option value="any">Cualquiera de los elegidos</option>
                      <option value="all">Todos los elegidos</option>
                    </select>
                  </label>
                )}
              </fieldset>
              <ActorPicker
                selected={people}
                onChange={setPeople}
                disabled={spinning || generating}
              />
              <div className="decision-field-row">
                <label className="decision-field">
                  <span>Desde el año</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1870}
                    max={2100}
                    placeholder="Cualquiera"
                    value={preferences.yearFrom ?? ""}
                    disabled={spinning || generating}
                    onChange={(e) =>
                      update(
                        "yearFrom",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </label>
                <label className="decision-field">
                  <span>Hasta el año</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1870}
                    max={2100}
                    placeholder="Actualidad"
                    value={preferences.yearTo ?? ""}
                    disabled={spinning || generating}
                    onChange={(e) =>
                      update(
                        "yearTo",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </label>
              </div>
              <label className="decision-field">
                <span>Tiempo disponible</span>
                <select
                  value={preferences.maxRuntime ?? ""}
                  disabled={spinning || generating}
                  onChange={(e) =>
                    update(
                      "maxRuntime",
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                >
                  <option value="">Sin límite de duración</option>
                  {[90, 120, 150, 180].map((minutes) => (
                    <option key={minutes} value={minutes}>
                      Hasta {minutes} minutos
                    </option>
                  ))}
                </select>
              </label>
              <label className="decision-field">
                <span>Valoración mínima</span>
                <select
                  value={preferences.minRating}
                  disabled={spinning || generating}
                  onChange={(e) => update("minRating", Number(e.target.value))}
                >
                  <option value={0}>Cualquier valoración</option>
                  {[5, 6, 7, 8, 9].map((rating) => (
                    <option value={rating} key={rating}>
                      {rating} / 10 o más
                    </option>
                  ))}
                </select>
                <small>Solo películas con al menos 100 votos en TMDB.</small>
              </label>
              <label className="decision-field">
                <span>Priorizar</span>
                <select
                  value={preferences.priority}
                  disabled={spinning || generating}
                  onChange={(e) =>
                    update(
                      "priority",
                      e.target.value as DecisionPreferences["priority"],
                    )
                  }
                >
                  <option value="popular">Más populares</option>
                  <option value="rated">Mejor valoradas</option>
                  <option value="recent">Más recientes</option>
                </select>
              </label>
              <label className="decision-field">
                <span>Tamaño de la selección</span>
                <select
                  value={preferences.count}
                  disabled={spinning || generating}
                  onChange={(e) =>
                    update(
                      "count",
                      Number(e.target.value) as DecisionPreferences["count"],
                    )
                  }
                >
                  {[6, 9, 12].map((count) => (
                    <option value={count} key={count}>
                      {count} películas
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="button decision-primary"
                disabled={generating || spinning}
              >
                {generating ? "Preparando selección…" : "Encontrar películas"}
                <Icon name="arrow" size={16} />
              </button>
              <button
                className="text-link reset-preferences"
                type="button"
                disabled={spinning || generating}
                onClick={() => {
                  setPreferences({ ...DEFAULT_PREFERENCES });
                  setPeople([]);
                  setError("");
                }}
              >
                Restablecer preferencias
              </button>
            </form>
          ) : (
            <div className="decision-custom-help">
              <p>
                Busca tus favoritas, añade las que te apetezcan y deja el
                desempate a la ruleta.
              </p>
              <div className="pending-import">
                <h3>¿Ya tienes pendientes?</h3>
                <p>
                  {pending.length
                    ? `${pending.length} películas esperan en tu lista.`
                    : "Guarda películas en Mi lista para reunirlas aquí."}
                </p>
                <button
                  className="button button-secondary"
                  disabled={
                    !libraryReady || !ready || !pending.length || spinning
                  }
                  onClick={() => replaceWheel(pending)}
                >
                  Usar mis pendientes
                </button>
                {pending.length > 12 && (
                  <small>Se usarán las 12 pendientes más recientes.</small>
                )}
              </div>
              <p className="field-hint">
                Puedes añadir hasta 12 películas y quitar cualquier candidata
                antes de girar.
              </p>
            </div>
          )}
        </section>
        <section
          className="decision-catalog"
          aria-labelledby="selection-heading"
        >
          <div className="decision-section-heading">
            <div>
              <h2 id="selection-heading">
                {mode === "discover"
                  ? "Tu selección"
                  : searchingForTitle
                    ? "Resultados"
                    : "Ideas para tu ruleta"}
              </h2>
              <p>
                {mode === "discover"
                  ? `${selection.movies.length} candidatas para hoy.`
                  : "Busca por título y prepara tu propia sesión."}
              </p>
            </div>
            {mode === "discover" && (
              <button
                className="text-link"
                onClick={() => void generate()}
                disabled={generating || spinning}
              >
                <Icon name="shuffle" size={15} />
                Renovar
              </button>
            )}
          </div>
          {mode === "custom" && (
            <form
              className="decision-title-search"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                if (query.trim().length >= 2) void searchMovies(query.trim());
              }}
            >
              <Icon name="search" />
              <label className="sr-only" htmlFor="wheel-movie-search">
                Buscar películas para mi ruleta
              </label>
              <input
                id="wheel-movie-search"
                value={query}
                placeholder="Busca una película por su título"
                maxLength={200}
                onChange={(e) => changeQuery(e.target.value)}
                disabled={spinning}
              />
              {query && (
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Limpiar búsqueda de películas"
                  onClick={() => changeQuery("")}
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </form>
          )}
          {error && mode === "discover" && (
            <div className="decision-alert" role="alert">
              <p>{error}</p>
              <button
                className="text-link"
                onClick={() => void generate()}
                disabled={generating || spinning}
              >
                Volver a intentar
              </button>
            </div>
          )}
          {searchError && searchingForTitle && (
            <div className="decision-alert" role="alert">
              <p>{searchError}</p>
              <button
                className="text-link"
                onClick={() => void searchMovies(query.trim())}
              >
                Reintentar búsqueda
              </button>
            </div>
          )}
          {mode === "discover" && (
            <p className="selection-provenance">
              {selection.sampled
                ? `Selección aleatoria de una muestra de ${selection.sampled} películas entre ${selection.total.toLocaleString("es")} coincidencias. La muestra sigue tu prioridad.`
                : "Las películas se eligen de una muestra de hasta 100 resultados que cumplan tus preferencias."}
            </p>
          )}
          {candidates.length > 0 && (
            <div className="selection-toolbar">
              <span>{wheel.length} en tu ruleta</span>
              <button
                className="button button-secondary"
                disabled={spinning || !ready || generating || searching}
                onClick={() => replaceWheel(candidates)}
              >
                {wheel.length ? "Reemplazar ruleta" : "Usar esta selección"}
                <Icon name="plus" size={15} />
              </button>
            </div>
          )}
          {candidatesLoading ? (
            <div
              className="decision-card-grid"
              role="status"
              aria-label="Cargando películas"
            >
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="decision-card-skeleton"
                  aria-hidden="true"
                >
                  <div className="skeleton skeleton-poster" />
                  <div className="skeleton skeleton-line" />
                </div>
              ))}
            </div>
          ) : candidates.length ? (
            <div className="decision-card-grid">
              {candidates.map((movie) => {
                const selected = wheel.some((item) => item.id === movie.id);
                return (
                  <article
                    className={`decision-movie-card ${selected ? "is-selected" : ""}`}
                    key={movie.id}
                  >
                    <div className="decision-poster">
                      <Link
                        href={`/movie/${movie.id}`}
                        aria-label={`Ver ficha de ${movie.title}`}
                      >
                        <MediaImage
                          path={movie.poster_path}
                          alt={`Cartel de ${movie.title}`}
                          sizes="(max-width:650px) 44vw, (max-width:1200px) 24vw, 190px"
                        />
                      </Link>
                      <button
                        className="decision-add"
                        disabled={spinning || !ready}
                        onClick={() => toggleMovie(movie)}
                        aria-pressed={selected}
                        aria-label={`${selected ? "Quitar de la ruleta" : "Añadir a la ruleta"}: ${movie.title}`}
                      >
                        <Icon name={selected ? "check" : "plus"} size={17} />
                      </button>
                    </div>
                    <div className="decision-movie-meta">
                      <span>
                        {movie.release_date?.slice(0, 4) || "Sin fecha"}
                      </span>
                      <span>
                        <Icon name="star" size={12} />
                        {movie.vote_count > 0
                          ? movie.vote_average.toFixed(1)
                          : "—"}
                      </span>
                    </div>
                    <h3>
                      <Link href={`/movie/${movie.id}`}>{movie.title}</Link>
                    </h3>
                    <button
                      className="decision-card-action"
                      disabled={spinning || !ready}
                      onClick={() => toggleMovie(movie)}
                      aria-pressed={selected}
                    >
                      {selected ? "En tu ruleta" : "Añadir a la ruleta"}
                      <Icon name={selected ? "check" : "plus"} size={13} />
                    </button>
                  </article>
                );
              })}
            </div>
          ) : !searchError ? (
            <div className="empty-state">
              <h3>
                {mode === "custom"
                  ? "No encontramos esa película"
                  : "No hay coincidencias"}
              </h3>
              <p>
                {mode === "custom"
                  ? "Prueba con el título original o revisa cómo está escrito."
                  : "Prueba a ampliar los años, quitar alguien del reparto o elegir menos géneros."}
              </p>
            </div>
          ) : null}
          {searchingForTitle &&
            searchData.page < Math.min(searchData.pages, 500) &&
            loadedQuery === query.trim() && (
              <div className="load-more">
                <button
                  className="button button-secondary"
                  disabled={searching || spinning}
                  onClick={() =>
                    void searchMovies(query.trim(), searchData.page + 1)
                  }
                >
                  {searching ? "Buscando…" : "Cargar más películas"}
                </button>
              </div>
            )}
        </section>
        <MovieWheel
          movies={wheel}
          ready={ready}
          spinning={spinning}
          onSpinningChange={setSpinning}
          onRemove={(id) =>
            commitWheel(
              wheel.filter((movie) => movie.id !== id),
              "Película quitada de la ruleta.",
            )
          }
          onClear={() =>
            commitWheel(
              [],
              "Tu ruleta está vacía. Puedes preparar otra selección.",
            )
          }
        />
      </div>
    </main>
  );
}
