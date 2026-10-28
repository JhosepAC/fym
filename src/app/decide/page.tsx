import Navbar from "@/components/Navbar";
import DecisionStudio from "@/components/decision/DecisionStudio";
import { createSelection } from "@/lib/decision-server";
import { DEFAULT_PREFERENCES, type DecisionSelection } from "@/lib/decision";
import "./decision.css";
export const metadata = {
  title: "Elige por mí — Tu próxima película",
  description:
    "Filtra películas por género, reparto o año y crea una ruleta para decidir qué ver.",
};
export const revalidate = 3600;
export default async function DecidePage() {
  let initial: DecisionSelection = { movies: [], sampled: 0, total: 0 };
  let failed = false;
  try {
    initial = await createSelection(DEFAULT_PREFERENCES);
  } catch {
    failed = true;
  }
  return (
    <>
      <Navbar />
      <DecisionStudio initial={initial} initialFailed={failed} />
    </>
  );
}
