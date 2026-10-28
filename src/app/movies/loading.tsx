import Navbar from "@/components/Navbar";
import LoadingGrid from "@/components/LoadingGrid";
export default function Loading() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="page-container">
        <div className="page-heading">
          <h1>Películas</h1>
        </div>
        <LoadingGrid />
      </main>
    </>
  );
}
