import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import type { Profile } from "@/lib/types";
import { DevsDirectory } from "@/components/devs/devs-directory";
import type { Metadata } from "next";

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
    .order("created_at", { ascending: false });

  return <DevsDirectory profiles={(profiles || []) as Profile[]} />;
}
