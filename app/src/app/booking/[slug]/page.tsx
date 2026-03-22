import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingPageClient } from "./booking-client";

interface BookingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BookingPageProps): Promise<Metadata> {
  const { slug } = await params;

  const { data: profile } = await supabaseAdmin
    .from(TABLES.profiles)
    .select("full_name, title")
    .eq("slug", slug)
    .eq("is_suspended", false)
    .single();

  if (!profile) {
    return { title: "Reservation - ivoire.io" };
  }

  return {
    title: `Prendre rendez-vous avec ${profile.full_name} - ivoire.io`,
    description: profile.title
      ? `Reservez un creneau avec ${profile.full_name} - ${profile.title}`
      : `Reservez un creneau avec ${profile.full_name} sur ivoire.io`,
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { slug } = await params;

  // Fetch profile
  const { data: profile } = await supabaseAdmin
    .from(TABLES.profiles)
    .select("id, slug, full_name, title, avatar_url, bio, city")
    .eq("slug", slug)
    .eq("is_suspended", false)
    .single();

  if (!profile) {
    notFound();
  }

  // Fetch availability slots
  const { data: slots } = await supabaseAdmin
    .from(TABLES.availability_slots)
    .select("id, day_of_week, start_time, end_time, is_active")
    .eq("profile_id", profile.id)
    .eq("is_active", true)
    .order("day_of_week", { ascending: true });

  if (!slots || slots.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0A0A0A", color: "#fff" }}
      >
        <div className="text-center max-w-md mx-auto px-6">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: "#111" }}
          >
            <span className="text-2xl">📅</span>
          </div>
          <h1 className="text-xl font-bold mb-2">Pas de creneaux disponibles</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            {profile.full_name} n&apos;a pas encore configure ses disponibilites.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BookingPageClient
      profile={profile}
      availableDays={[...new Set(slots.map((s) => s.day_of_week))]}
      slug={slug}
    />
  );
}
