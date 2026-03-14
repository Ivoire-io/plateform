import { AdminShell } from "@/components/admin/admin-shell";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration — ivoire.io",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from(TABLES.profiles)
    .select("*")
    .eq("id", user!.id)
    .single();

  return <AdminShell adminEmail={user!.email ?? ""} adminProfile={profile} />;
}
