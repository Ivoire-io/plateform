import { DevsDirectory } from "@/components/devs/devs-directory";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { TABLES } from "@/lib/utils";
import type { Metadata } from "next";

// Toujours rendu dynamiquement — les préférences de confidentialité doivent être lues en temps réel
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Annuaire des développeurs — devs.ivoire.io",
  description:
    "Trouvez les meilleurs développeurs de Côte d'Ivoire. Filtrez par technologie, ville et disponibilité.",
};

export default async function DevsPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from(TABLES.profiles)
    .select("*")
    .eq("type", "developer")
    .eq("privacy_visible_in_directory", true)
    .order("created_at", { ascending: false });

  return <DevsDirectory profiles={(profiles || []) as Profile[]} />;
}
