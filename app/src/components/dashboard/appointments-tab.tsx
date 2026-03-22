"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Appointment, AvailabilitySlot } from "@/lib/types";
import {
  Calendar,
  Check,
  Clock,
  Copy,
  Loader2,
  Mail,
  Phone,
  Plus,
  Save,
  StickyNote,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface AppointmentsTabProps {
  profileId: string;
}

const DAY_NAMES = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

type AppointmentView = "upcoming" | "past";

interface SlotForm {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending: {
      label: "En attente",
      bg: "rgba(234,179,8,0.15)",
      color: "#eab308",
    },
    confirmed: {
      label: "Confirme",
      bg: "rgba(34,197,94,0.15)",
      color: "#22c55e",
    },
    cancelled: {
      label: "Annule",
      bg: "rgba(239,68,68,0.15)",
      color: "#ef4444",
    },
    completed: {
      label: "Termine",
      bg: "rgba(59,130,246,0.15)",
      color: "#3b82f6",
    },
    no_show: {
      label: "Absent",
      bg: "rgba(107,114,128,0.15)",
      color: "#6b7280",
    },
  };
  const info = map[status] ?? {
    label: status,
    bg: "rgba(107,114,128,0.15)",
    color: "#6b7280",
  };
  return (
    <Badge
      className="text-xs px-2 py-0.5"
      style={{ background: info.bg, color: info.color, border: "none" }}
    >
      {info.label}
    </Badge>
  );
}

export function AppointmentsTab({ profileId }: AppointmentsTabProps) {
  // ── Availability state ──
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotForms, setSlotForms] = useState<SlotForm[]>([]);
  const [savingSlots, setSavingSlots] = useState(false);

  // ── Appointments state ──
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptLoading, setApptLoading] = useState(true);
  const [apptView, setApptView] = useState<AppointmentView>("upcoming");

  // ── Cancel dialog state ──
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Fetch availability slots
  const fetchSlots = useCallback(async () => {
    setSlotsLoading(true);
    try {
      const res = await fetch("/api/dashboard/availability");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const fetchedSlots: AvailabilitySlot[] = data.slots ?? [];
      setSlots(fetchedSlots);

      // Initialize forms from fetched slots
      setSlotForms(
        fetchedSlots.map((s) => ({
          id: s.id,
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          is_active: s.is_active,
        }))
      );
    } catch {
      toast.error("Impossible de charger les disponibilites");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    setApptLoading(true);
    try {
      const res = await fetch(
        `/api/dashboard/appointments?status=${apptView}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAppointments(data.appointments ?? []);
    } catch {
      toast.error("Impossible de charger les rendez-vous");
    } finally {
      setApptLoading(false);
    }
  }, [apptView]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // ── Slot management ──

  function addSlot(dayOfWeek: number) {
    setSlotForms((prev) => [
      ...prev,
      {
        day_of_week: dayOfWeek,
        start_time: "09:00",
        end_time: "17:00",
        is_active: true,
      },
    ]);
  }

  function removeSlotForm(index: number) {
    setSlotForms((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSlotForm(
    index: number,
    field: keyof SlotForm,
    value: string | number | boolean
  ) {
    setSlotForms((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  async function saveSlots() {
    setSavingSlots(true);

    try {
      // Delete removed slots (slots that exist in DB but not in forms)
      const currentFormIds = slotForms
        .filter((f) => f.id)
        .map((f) => f.id);
      const slotsToDelete = slots.filter(
        (s) => !currentFormIds.includes(s.id)
      );

      for (const slot of slotsToDelete) {
        await fetch(`/api/dashboard/availability?id=${slot.id}`, {
          method: "DELETE",
        });
      }

      // Create or update each slot
      for (const form of slotForms) {
        if (form.start_time >= form.end_time) {
          toast.error(
            `${DAY_NAMES[form.day_of_week]}: L'heure de debut doit etre avant l'heure de fin`
          );
          setSavingSlots(false);
          return;
        }

        await fetch("/api/dashboard/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: form.id ?? undefined,
            day_of_week: form.day_of_week,
            start_time: form.start_time,
            end_time: form.end_time,
            is_active: form.is_active,
          }),
        });
      }

      toast.success("Disponibilites enregistrees");
      fetchSlots();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSavingSlots(false);
    }
  }

  // ── Appointment actions ──

  async function cancelAppointment() {
    if (!cancelTarget) return;
    setCancelling(true);

    try {
      const res = await fetch("/api/dashboard/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cancelTarget,
          status: "cancelled",
          cancellation_reason: cancelReason.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error();

      toast.success("Rendez-vous annule");
      setCancelTarget(null);
      setCancelReason("");
      fetchAppointments();
    } catch {
      toast.error("Erreur lors de l'annulation");
    } finally {
      setCancelling(false);
    }
  }

  async function markAppointment(id: string, status: "completed" | "no_show") {
    try {
      const res = await fetch("/api/dashboard/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();

      toast.success(
        status === "completed"
          ? "Rendez-vous marque comme termine"
          : "Rendez-vous marque comme absent"
      );
      fetchAppointments();
    } catch {
      toast.error("Erreur lors de la mise a jour");
    }
  }

  // Group slot forms by day
  const slotsByDay: Record<number, SlotForm[]> = {};
  for (const form of slotForms) {
    if (!slotsByDay[form.day_of_week]) {
      slotsByDay[form.day_of_week] = [];
    }
    slotsByDay[form.day_of_week].push(form);
  }

  // Get the booking URL
  const bookingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/booking/${profileId}`
    : "";

  return (
    <div className="flex flex-col gap-8">
      {/* ── Section 1: Availability ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Mes creneaux</h2>
            <p className="text-muted-foreground text-sm mt-0.5">
              Definissez vos disponibilites hebdomadaires
            </p>
          </div>
          <Button
            size="sm"
            onClick={saveSlots}
            disabled={savingSlots}
            style={{ background: "var(--color-orange)", color: "#fff" }}
          >
            {savingSlots ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1.5" />
            )}
            Enregistrer
          </Button>
        </div>

        {slotsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl animate-pulse"
                style={{ background: "var(--color-surface)" }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6, 0].map((dayNum) => {
              const daySlotsForDay = slotsByDay[dayNum] ?? [];
              const dayName = DAY_NAMES[dayNum];

              return (
                <Card key={dayNum}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold">{dayName}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => addSlot(dayNum)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Ajouter
                      </Button>
                    </div>

                    {daySlotsForDay.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Aucun creneau
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {daySlotsForDay.map((form) => {
                          const globalIndex = slotForms.indexOf(form);
                          return (
                            <div
                              key={globalIndex}
                              className="flex items-center gap-2"
                            >
                              <Input
                                type="time"
                                value={form.start_time}
                                onChange={(e) =>
                                  updateSlotForm(
                                    globalIndex,
                                    "start_time",
                                    e.target.value
                                  )
                                }
                                className="h-8 text-xs w-[100px]"
                              />
                              <span className="text-xs text-muted-foreground">
                                -
                              </span>
                              <Input
                                type="time"
                                value={form.end_time}
                                onChange={(e) =>
                                  updateSlotForm(
                                    globalIndex,
                                    "end_time",
                                    e.target.value
                                  )
                                }
                                className="h-8 text-xs w-[100px]"
                              />
                              <button
                                onClick={() =>
                                  updateSlotForm(
                                    globalIndex,
                                    "is_active",
                                    !form.is_active
                                  )
                                }
                                className="shrink-0 w-8 h-5 rounded-full transition-colors relative"
                                style={{
                                  background: form.is_active
                                    ? "#FF6B00"
                                    : "#333",
                                }}
                              >
                                <div
                                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                                  style={{
                                    left: form.is_active ? "14px" : "2px",
                                  }}
                                />
                              </button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-600 shrink-0"
                                onClick={() => removeSlotForm(globalIndex)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Booking link */}
        {slots.length > 0 && (
          <div
            className="mt-4 rounded-xl p-4 flex items-center justify-between gap-3"
            style={{
              background: "rgba(255,107,0,0.05)",
              border: "1px solid rgba(255,107,0,0.15)",
            }}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium" style={{ color: "#FF6B00" }}>
                Lien de reservation public
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                Partagez ce lien pour permettre aux visiteurs de prendre
                rendez-vous
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/booking/${profileId}`
                );
                toast.success("Lien copie !");
              }}
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copier
            </Button>
          </div>
        )}
      </div>

      {/* ── Section 2: Appointments ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Mes rendez-vous</h2>
            <p className="text-muted-foreground text-sm mt-0.5">
              Gerez vos rendez-vous
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={apptView === "upcoming" ? "default" : "outline"}
              onClick={() => setApptView("upcoming")}
              style={
                apptView === "upcoming"
                  ? { background: "var(--color-orange)", color: "#fff" }
                  : {}
              }
            >
              A venir
            </Button>
            <Button
              size="sm"
              variant={apptView === "past" ? "default" : "outline"}
              onClick={() => setApptView("past")}
              style={
                apptView === "past"
                  ? { background: "var(--color-orange)", color: "#fff" }
                  : {}
              }
            >
              Passes
            </Button>
          </div>
        </div>

        {apptLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl animate-pulse"
                style={{ background: "var(--color-surface)" }}
              />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>
                Aucun rendez-vous{" "}
                {apptView === "upcoming" ? "a venir" : "passe"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {appointments.map((appt) => (
              <Card key={appt.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-semibold text-sm flex items-center gap-1.5">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {appt.guest_name}
                        </span>
                        {statusBadge(appt.status)}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(
                            appt.date + "T00:00:00"
                          ).toLocaleDateString("fr-FR", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {appt.start_time} - {appt.end_time} (
                          {appt.duration_minutes}min)
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {appt.guest_email}
                        </span>
                        {appt.guest_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {appt.guest_phone}
                          </span>
                        )}
                      </div>

                      {appt.notes && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                          <StickyNote className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          {appt.notes}
                        </p>
                      )}

                      {appt.cancellation_reason && (
                        <p className="text-xs text-red-400 mt-1 flex items-start gap-1">
                          <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          Raison: {appt.cancellation_reason}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-1 shrink-0">
                      {apptView === "upcoming" &&
                        ["pending", "confirmed"].includes(appt.status) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs text-red-500 hover:text-red-600"
                            onClick={() => setCancelTarget(appt.id)}
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Annuler
                          </Button>
                        )}
                      {apptView === "past" &&
                        appt.status === "confirmed" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-xs text-green-500 hover:text-green-600"
                              onClick={() =>
                                markAppointment(appt.id, "completed")
                              }
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Termine
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-xs text-yellow-500 hover:text-yellow-600"
                              onClick={() =>
                                markAppointment(appt.id, "no_show")
                              }
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Absent
                            </Button>
                          </>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cancel confirmation dialog */}
      <Dialog
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open) {
            setCancelTarget(null);
            setCancelReason("");
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Annuler le rendez-vous ?</DialogTitle>
            <DialogDescription>
              Le visiteur sera informe de l&apos;annulation.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm text-muted-foreground block mb-1.5">
              Raison (optionnel)
            </label>
            <Input
              placeholder="Raison de l'annulation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCancelTarget(null);
                setCancelReason("");
              }}
            >
              Retour
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={cancelling}
              onClick={cancelAppointment}
            >
              {cancelling ? "Annulation..." : "Confirmer l'annulation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
