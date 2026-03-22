import { DevsDirectory } from "@/components/devs/devs-directory";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Annuaire des developpeurs -- devs.ivoire.io",
  description:
    "Trouvez les meilleurs developpeurs de Cote d'Ivoire. Filtrez par technologie, ville et disponibilite.",
};

export default function DevsPage() {
  return (
    <Suspense>
      <DevsDirectory />
    </Suspense>
  );
}
