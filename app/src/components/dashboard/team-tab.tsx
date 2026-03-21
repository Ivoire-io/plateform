"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ExternalLink,
  Linkedin,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Users
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  linkedin: string;
  ivoireio_slug: string;
}

type MemberFormData = Omit<TeamMember, "id">;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const emptyForm: MemberFormData = {
  name: "",
  role: "",
  email: "",
  linkedin: "",
  ivoireio_slug: "",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TeamTab({ startupId }: { startupId: string }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Sheet (add / edit)
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<MemberFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ---- Fetch team members ---- */

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/team");
      if (!res.ok) throw new Error("Erreur chargement");
      const data = await res.json();
      setMembers(data.members ?? []);
    } catch {
      toast.error("Impossible de charger l\u2019\u00e9quipe.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  /* ---- Form helpers ---- */

  function setField(field: keyof MemberFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openAddSheet() {
    setEditingMember(null);
    setForm(emptyForm);
    setSheetOpen(true);
  }

  function openEditSheet(member: TeamMember) {
    setEditingMember(member);
    setForm({
      name: member.name,
      role: member.role,
      email: member.email,
      linkedin: member.linkedin,
      ivoireio_slug: member.ivoireio_slug,
    });
    setSheetOpen(true);
  }

  function handleSheetClose() {
    setSheetOpen(false);
    setEditingMember(null);
    setForm(emptyForm);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim() || !form.role.trim()) {
      toast.error("Le nom et le r\u00f4le sont requis.");
      return;
    }

    setSaving(true);

    const url = editingMember
      ? `/api/dashboard/team/${editingMember.id}`
      : "/api/dashboard/team";
    const method = editingMember ? "PATCH" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        if (editingMember) {
          toast.success(`Profil de ${form.name} mis \u00e0 jour !`);
        } else {
          toast.success(`${form.name} ajout\u00e9(e) \u00e0 l\u2019\u00e9quipe !`);
        }
        handleSheetClose();
        await fetchMembers();
      })
      .catch(() => {
        toast.error("Une erreur est survenue.");
      })
      .finally(() => {
        setSaving(false);
      });
  }

  /* ---- Delete helpers ---- */

  function openDeleteDialog(member: TeamMember) {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  }

  function handleDeleteConfirm() {
    if (!memberToDelete) return;

    setDeleting(true);

    fetch(`/api/dashboard/team/${memberToDelete.id}`, { method: "DELETE" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Erreur suppression");
        toast.success(`${memberToDelete.name} a \u00e9t\u00e9 retir\u00e9(e) de l\u2019\u00e9quipe.`);
        setDeleteDialogOpen(false);
        setMemberToDelete(null);
        await fetchMembers();
      })
      .catch(() => {
        toast.error("Impossible de supprimer ce membre.");
      })
      .finally(() => {
        setDeleting(false);
      });
  }

  /* ---- Render ---- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users
              className="h-5 w-5"
              style={{ color: "var(--color-orange)" }}
            />
            \u00c9quipe
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            G\u00e9rez les membres de votre \u00e9quipe et leur pr\u00e9sence sur ivoire.io.
          </p>
        </div>
        <Button
          onClick={openAddSheet}
          style={{ background: "var(--color-orange)", color: "white" }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un membre
        </Button>
      </div>

      {/* Members grid */}
      {members.length === 0 ? (
        <div
          className="rounded-xl border border-dashed border-border flex flex-col items-center justify-center py-16 gap-4 text-center"
          style={{ background: "var(--color-surface)" }}
        >
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">Aucun membre dans l&apos;\u00e9quipe</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Ajoutez les membres de votre \u00e9quipe pour les afficher sur votre
              vitrine ivoire.io.
            </p>
          </div>
          <Button
            onClick={openAddSheet}
            style={{ background: "var(--color-orange)", color: "white" }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter le premier membre
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {members.map((member) => (
            <Card
              key={member.id}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
              className="group relative"
            >
              <CardContent className="p-5">
                {/* Action buttons (top-right) */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => openEditSheet(member)}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Modifier"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteDialog(member)}
                    className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar size="lg">
                    <AvatarFallback
                      className="text-xs font-semibold"
                      style={{
                        background: "var(--color-orange)",
                        color: "white",
                      }}
                    >
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {member.role}
                    </p>

                    {/* Links */}
                    <div className="flex items-center gap-2 mt-3">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-blue-400"
                          title="LinkedIn"
                        >
                          <Linkedin className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {member.ivoireio_slug && (
                        <a
                          href={`https://ivoire.io/${member.ivoireio_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs hover:bg-muted transition-colors text-muted-foreground"
                          style={{ color: "var(--color-orange)" }}
                          title="Profil ivoire.io"
                        >
                          <ExternalLink className="h-3 w-3" />
                          ivoire.io
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Members count */}
      {members.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {members.length} membre{members.length > 1 ? "s" : ""} dans
          l&apos;\u00e9quipe
        </p>
      )}

      {/* ---- Sheet: Add / Edit member ---- */}
      <Sheet open={sheetOpen} onOpenChange={(open) => !open && handleSheetClose()}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingMember ? "Modifier le membre" : "Ajouter un membre"}
            </SheetTitle>
            <SheetDescription>
              {editingMember
                ? "Mettez \u00e0 jour les informations de ce membre."
                : "Renseignez les informations du nouveau membre de l\u2019\u00e9quipe."}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 pb-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="member-name">
                Nom complet <span className="text-orange-400">*</span>
              </Label>
              <Input
                id="member-name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Ex: Amadou Coulibaly"
                required
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label htmlFor="member-role">
                R\u00f4le <span className="text-orange-400">*</span>
              </Label>
              <Input
                id="member-role"
                value={form.role}
                onChange={(e) => setField("role", e.target.value)}
                placeholder="Ex: CTO, Designer, Marketing..."
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="amadou@startup.ci"
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-1.5">
              <Label htmlFor="member-linkedin" className="flex items-center gap-1.5">
                <Linkedin className="h-3.5 w-3.5 text-blue-400" />
                LinkedIn
              </Label>
              <Input
                id="member-linkedin"
                type="url"
                value={form.linkedin}
                onChange={(e) => setField("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/amadou"
              />
            </div>

            {/* ivoire.io slug */}
            <div className="space-y-1.5">
              <Label htmlFor="member-slug" className="flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" style={{ color: "var(--color-orange)" }} />
                Profil ivoire.io
              </Label>
              <div className="flex items-center gap-0">
                <span className="inline-flex items-center px-3 h-9 rounded-l-md border border-r-0 border-border bg-muted text-xs text-muted-foreground">
                  ivoire.io/
                </span>
                <Input
                  id="member-slug"
                  value={form.ivoireio_slug}
                  onChange={(e) =>
                    setField(
                      "ivoireio_slug",
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                    )
                  }
                  placeholder="amadou"
                  className="rounded-l-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Lier ce membre \u00e0 un profil existant sur ivoire.io.
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1"
                style={{ background: "var(--color-orange)", color: "white" }}
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingMember ? "Enregistrer" : "Ajouter"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSheetClose}
                disabled={saving}
              >
                Annuler
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* ---- Dialog: Delete confirmation ---- */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogOpen(false);
            setMemberToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer ce membre ?</DialogTitle>
            <DialogDescription>
              {memberToDelete
                ? `${memberToDelete.name} (${memberToDelete.role}) sera retir\u00e9(e) de l\u2019\u00e9quipe. Cette action est irr\u00e9versible.`
                : "Ce membre sera retir\u00e9 de l\u2019\u00e9quipe."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setMemberToDelete(null);
              }}
              disabled={deleting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
