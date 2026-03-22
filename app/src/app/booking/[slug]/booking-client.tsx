"use client";

import { CheckCircle, ChevronLeft, ChevronRight, Clock, Loader2, MapPin } from "lucide-react";
import { useState } from "react";

interface BookingProfile {
  id: string;
  slug: string;
  full_name: string;
  title: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
}

interface TimeSlot {
  start_time: string;
  end_time: string;
}

interface BookingPageClientProps {
  profile: BookingProfile;
  availableDays: number[];
  slug: string;
}

const DAY_NAMES_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTH_NAMES = [
  "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

export function BookingPageClient({
  profile,
  availableDays,
  slug,
}: BookingPageClientProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [step, setStep] = useState<"date" | "time" | "form" | "confirmed">("date");

  // Form fields
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calendar state
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  // Generate calendar days for the current month view
  function getCalendarDays() {
    const firstDay = new Date(calendarYear, calendarMonth, 1);
    const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: Array<{ date: Date; dayNum: number; isCurrentMonth: boolean; isAvailable: boolean; isPast: boolean }> = [];

    // Previous month padding
    for (let i = 0; i < startDayOfWeek; i++) {
      const d = new Date(calendarYear, calendarMonth, -startDayOfWeek + i + 1);
      days.push({
        date: d,
        dayNum: d.getDate(),
        isCurrentMonth: false,
        isAvailable: false,
        isPast: true,
      });
    }

    // Current month days
    const todayStr = today.toISOString().split("T")[0];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(calendarYear, calendarMonth, d);
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayOfWeek = date.getDay();
      const isPast = dateStr < todayStr;
      const isAvailable = !isPast && availableDays.includes(dayOfWeek);

      // Limit to next 30 days
      const diffDays = Math.floor(
        (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      days.push({
        date,
        dayNum: d,
        isCurrentMonth: true,
        isAvailable: isAvailable && diffDays <= 30,
        isPast,
      });
    }

    // Next month padding (fill to complete 6 rows)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(calendarYear, calendarMonth + 1, i);
      days.push({
        date: d,
        dayNum: i,
        isCurrentMonth: false,
        isAvailable: false,
        isPast: false,
      });
    }

    return days;
  }

  async function handleDateSelect(date: Date) {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setError(null);
    setSlotsLoading(true);
    setStep("time");

    try {
      const res = await fetch(
        `/api/booking/${slug}/slots?date=${dateStr}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setError("Impossible de charger les creneaux.");
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }

  function handleSlotSelect(slot: TimeSlot) {
    setSelectedSlot(slot);
    setStep("form");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !guestName.trim() || !guestEmail.trim()) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/booking/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          start_time: selectedSlot.start_time,
          end_time: selectedSlot.end_time,
          guest_name: guestName.trim(),
          guest_email: guestEmail.trim(),
          guest_phone: guestPhone.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la reservation.");
        return;
      }

      setStep("confirmed");
    } catch {
      setError("Erreur de connexion. Veuillez reessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  function prevMonth() {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  }

  function nextMonth() {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  }

  const calendarDays = getCalendarDays();

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0A0A0A", color: "#fff" }}
    >
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Profile header */}
        <div className="text-center mb-8">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2"
              style={{ borderColor: "#FF6B00" }}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
              style={{ background: "#111", color: "#FF6B00" }}
            >
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-bold">{profile.full_name}</h1>
          {profile.title && (
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
              {profile.title}
            </p>
          )}
          {profile.city && (
            <p
              className="text-xs mt-1 flex items-center justify-center gap-1"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <MapPin className="w-3 h-3" />
              {profile.city}
            </p>
          )}
          <p className="text-sm mt-3" style={{ color: "#FF6B00" }}>
            Prendre rendez-vous
          </p>
        </div>

        {/* Step indicators */}
        {step !== "confirmed" && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {["date", "time", "form"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background:
                      step === s
                        ? "#FF6B00"
                        : ["date", "time", "form"].indexOf(step) > i
                          ? "rgba(255,107,0,0.3)"
                          : "#1a1a2e",
                    color:
                      step === s || ["date", "time", "form"].indexOf(step) > i
                        ? "#fff"
                        : "rgba(255,255,255,0.4)",
                  }}
                >
                  {i + 1}
                </div>
                {i < 2 && (
                  <div
                    className="w-8 h-0.5"
                    style={{
                      background:
                        ["date", "time", "form"].indexOf(step) > i
                          ? "rgba(255,107,0,0.5)"
                          : "#1a1a2e",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step: Date selection */}
        {step === "date" && (
          <div
            className="rounded-xl p-6"
            style={{ background: "#111", border: "1px solid #1a1a2e" }}
          >
            <h2 className="text-lg font-semibold mb-4 text-center">
              Choisissez une date
            </h2>

            {/* Calendar navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium">
                {MONTH_NAMES[calendarMonth]} {calendarYear}
              </span>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAY_NAMES_SHORT.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium py-1"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => (
                <button
                  key={idx}
                  disabled={!day.isAvailable || !day.isCurrentMonth}
                  className="aspect-square flex items-center justify-center rounded-lg text-sm transition-all"
                  style={{
                    background: day.isAvailable
                      ? "rgba(255,107,0,0.1)"
                      : "transparent",
                    color: !day.isCurrentMonth
                      ? "rgba(255,255,255,0.15)"
                      : day.isAvailable
                        ? "#FF6B00"
                        : day.isPast
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(255,255,255,0.4)",
                    cursor: day.isAvailable ? "pointer" : "default",
                    fontWeight: day.isAvailable ? 600 : 400,
                  }}
                  onClick={() => {
                    if (day.isAvailable) handleDateSelect(day.date);
                  }}
                  onMouseEnter={(e) => {
                    if (day.isAvailable) {
                      e.currentTarget.style.background = "rgba(255,107,0,0.25)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (day.isAvailable) {
                      e.currentTarget.style.background = "rgba(255,107,0,0.1)";
                    }
                  }}
                >
                  {day.dayNum}
                </button>
              ))}
            </div>

            <p
              className="text-xs text-center mt-4"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Les jours en orange sont disponibles
            </p>
          </div>
        )}

        {/* Step: Time selection */}
        {step === "time" && (
          <div
            className="rounded-xl p-6"
            style={{ background: "#111", border: "1px solid #1a1a2e" }}
          >
            <button
              onClick={() => setStep("date")}
              className="flex items-center gap-1 text-sm mb-4 hover:opacity-80 transition-opacity"
              style={{ color: "#FF6B00" }}
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </button>

            <h2 className="text-lg font-semibold mb-1 text-center">
              Choisissez un creneau
            </h2>
            {selectedDate && (
              <p
                className="text-sm text-center mb-6"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                  "fr-FR",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>
            )}

            {slotsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#FF6B00" }} />
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Aucun creneau disponible pour cette date
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSlotSelect(slot)}
                    className="py-3 px-2 rounded-lg text-sm font-medium transition-all text-center"
                    style={{
                      background: "rgba(255,107,0,0.1)",
                      color: "#FF6B00",
                      border: "1px solid rgba(255,107,0,0.2)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#FF6B00";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,107,0,0.1)";
                      e.currentTarget.style.color = "#FF6B00";
                    }}
                  >
                    {slot.start_time}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400 text-center mt-4">{error}</p>
            )}
          </div>
        )}

        {/* Step: Guest form */}
        {step === "form" && (
          <div
            className="rounded-xl p-6"
            style={{ background: "#111", border: "1px solid #1a1a2e" }}
          >
            <button
              onClick={() => setStep("time")}
              className="flex items-center gap-1 text-sm mb-4 hover:opacity-80 transition-opacity"
              style={{ color: "#FF6B00" }}
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </button>

            <h2 className="text-lg font-semibold mb-1 text-center">
              Vos informations
            </h2>
            {selectedDate && selectedSlot && (
              <p
                className="text-sm text-center mb-6"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                  "fr-FR",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  }
                )}{" "}
                a {selectedSlot.start_time} - {selectedSlot.end_time}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Votre nom"
                  required
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{
                    background: "#1a1a2e",
                    border: "1px solid #2a2a3e",
                    color: "#fff",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#FF6B00";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#2a2a3e";
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{
                    background: "#1a1a2e",
                    border: "1px solid #2a2a3e",
                    color: "#fff",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#FF6B00";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#2a2a3e";
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Telephone (optionnel)
                </label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+225 XX XX XX XX"
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{
                    background: "#1a1a2e",
                    border: "1px solid #2a2a3e",
                    color: "#fff",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#FF6B00";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#2a2a3e";
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Notes (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Objet du rendez-vous, questions..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors resize-none"
                  style={{
                    background: "#1a1a2e",
                    border: "1px solid #2a2a3e",
                    color: "#fff",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#FF6B00";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#2a2a3e";
                  }}
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  background: submitting ? "rgba(255,107,0,0.5)" : "#FF6B00",
                  color: "#fff",
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reservation en cours...
                  </>
                ) : (
                  "Confirmer le rendez-vous"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step: Confirmed */}
        {step === "confirmed" && (
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: "#111", border: "1px solid #1a1a2e" }}
          >
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.15)" }}
            >
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Rendez-vous confirme !</h2>
            <p
              className="text-sm mb-4"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Votre rendez-vous avec {profile.full_name} a ete confirme.
            </p>

            {selectedDate && selectedSlot && (
              <div
                className="inline-flex items-center gap-4 rounded-lg px-6 py-3 mb-6"
                style={{ background: "#1a1a2e" }}
              >
                <div className="text-left">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Date
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                      "fr-FR",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
                <div
                  className="w-px h-8"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                />
                <div className="text-left">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Heure
                  </p>
                  <p className="text-sm font-medium">
                    {selectedSlot.start_time} - {selectedSlot.end_time}
                  </p>
                </div>
              </div>
            )}

            <p
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Un email de confirmation sera envoye a {guestEmail}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <a
            href="https://ivoire.io"
            className="text-xs hover:opacity-80 transition-opacity"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Propulse par{" "}
            <span style={{ color: "#FF6B00" }}>ivoire.io</span>
          </a>
        </div>
      </div>
    </div>
  );
}
