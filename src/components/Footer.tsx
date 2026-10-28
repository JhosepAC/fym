import Link from "next/link";
import Logo from "./Logo";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Link href="/" className="footer-brand">
          <Logo />
        </Link>
        <span>Buenas historias. Tu próxima elección.</span>
      </div>
      <p>
        Datos:{" "}
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">
          TMDB
        </a>
        . Sin aval de TMDB. Disponibilidad: JustWatch.
      </p>
      <p className="developer-credit">
        Desarrollado por{" "}
        <a
          href="https://jhosep-ac.pages.dev/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Jhosep Argomedo
        </a>
      </p>
    </footer>
  );
}
