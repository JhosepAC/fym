"use client";
import Navbar from "@/components/Navbar";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container">
        <div className="empty-state" role="alert">
          <h1>No pudimos cargar esta página</h1>
          <p>
            El catálogo puede estar temporalmente fuera de servicio. Comprueba
            tu conexión y vuelve a intentarlo.
          </p>
          <button className="button button-primary" onClick={reset}>
            Volver a intentar
          </button>
        </div>
      </main>
    </>
  );
}
