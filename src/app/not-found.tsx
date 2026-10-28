import Link from "next/link";
import Navbar from "@/components/Navbar";
export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container">
        <div className="empty-state">
          <h1>Esta historia no está aquí</h1>
          <p>La página que buscas no existe o ya no está disponible.</p>
          <Link href="/" className="button button-primary">
            Volver a descubrir
          </Link>
        </div>
      </main>
    </>
  );
}
