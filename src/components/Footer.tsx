import Link from "next/link";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Link href="/" className="footer-brand">
          FyM.
        </Link>
        <span>Buenas historias. Tu próxima elección.</span>
      </div>
      <p>
        Datos e imágenes de{" "}
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">
          TMDB
        </a>
        . Este producto utiliza la API de TMDB, pero no está avalado ni
        certificado por TMDB. Disponibilidad de streaming de JustWatch.
      </p>
      <Link href="/watchlist">Tu cine, en una lista</Link>
    </footer>
  );
}
