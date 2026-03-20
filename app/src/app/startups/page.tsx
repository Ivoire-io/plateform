import { StartupsDirectory } from "@/components/startups/startups-directory";
import { createClient } from "@/lib/supabase/server";
import type { Startup } from "@/lib/types";
import { TABLES } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Startups — startups.ivoire.io",
  description:
    "Découvrez les startups les plus innovantes de Côte d'Ivoire. Le Product Hunt ivoirien.",
};

export default async function StartupsPage() {
  const supabase = await createClient();

  const { data: startups } = await supabase
    .from(TABLES.startups)
    .select("*, profile:ivoireio_profiles!profile_id(full_name, slug, avatar_url)")
    .eq("status", "approved")
    .order("upvotes_count", { ascending: false });

  return <StartupsDirectory startups={(startups || []) as Startup[]} />;
}
