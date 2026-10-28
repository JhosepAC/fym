export default function LoadingGrid({ count = 12 }: { count?: number }) {
  return (
    <div role="status" aria-label="Cargando títulos">
      <p className="loading-label">Buscando buenas historias…</p>
      <div className="media-grid" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div key={i}>
            <div className="skeleton skeleton-poster" />
            <div className="skeleton skeleton-line" />
          </div>
        ))}
      </div>
    </div>
  );
}
