"use client";
import { useEffect, useState } from "react";
import type { PersonOption } from "@/lib/decision";
import MediaImage from "../MediaImage";
import Icon from "../Icon";
export default function ActorPicker({
  selected,
  onChange,
  disabled,
}: {
  selected: PersonOption[];
  onChange: (people: PersonOption[]) => void;
  disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PersonOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setError("");
      if (query.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(
          `/api/people?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal },
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (!controller.signal.aborted) setResults(data.results);
      } catch {
        if (!controller.signal.aborted)
          setError(
            "No se pudo buscar el reparto. Vuelve a escribir el nombre.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);
  return (
    <div className="actor-picker">
      <label htmlFor="actor-query">
        Reparto <span className="muted">Opcional</span>
      </label>
      <div className="decision-input-icon">
        <Icon name="search" size={15} />
        <input
          id="actor-query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar actriz o actor"
          autoComplete="off"
          maxLength={100}
          disabled={disabled || selected.length >= 3}
          aria-describedby="actor-help"
        />
      </div>
      <p className="field-hint" id="actor-help">
        Hasta 3 personas. La película debe incluir a todas.
      </p>
      {selected.length > 0 && (
        <div className="selected-people">
          {selected.map((person) => (
            <button
              type="button"
              key={person.id}
              disabled={disabled}
              onClick={() =>
                onChange(selected.filter((p) => p.id !== person.id))
              }
              aria-label={`Quitar a ${person.name}`}
            >
              <span>{person.name}</span>
              <Icon name="close" size={12} />
            </button>
          ))}
        </div>
      )}
      {loading && (
        <p className="field-hint" role="status">
          Buscando reparto…
        </p>
      )}
      {error && (
        <p className="decision-error" role="alert">
          {error}
        </p>
      )}
      {!loading && query.trim().length >= 2 && !error && (
        <div
          className="actor-results"
          role="group"
          aria-label="Coincidencias de reparto"
        >
          {results
            .filter((p) => !selected.some((s) => s.id === p.id))
            .map((person) => (
              <button
                type="button"
                key={person.id}
                disabled={disabled || selected.length >= 3}
                onClick={() => {
                  onChange([...selected, person]);
                  setQuery("");
                  setResults([]);
                }}
              >
                <span className="actor-thumb">
                  <MediaImage path={person.profile_path} alt="" sizes="36px" />
                </span>
                <span>
                  <strong>{person.name}</strong>
                  <small>
                    {person.known_for.join(", ") ||
                      "Reparto de cine y televisión"}
                  </small>
                </span>
                <Icon name="plus" size={14} />
              </button>
            ))}
          {!results.length && (
            <p className="field-hint">
              No encontramos a esa persona. Prueba con su nombre completo.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
