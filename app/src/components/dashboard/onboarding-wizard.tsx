"use client";

import { useDynamicFields } from "@/hooks/use-dynamic-fields";
import type { Profile } from "@/lib/types";
import {
  Briefcase,
  Building2,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  FolderOpen,
  Globe,
  Layout,
  Loader2,
  Mail,
  Plus,
  Rocket,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface OnboardingWizardProps {
  profile: Profile;
  onComplete: () => void;
}

// ─── Step definitions ───────────────────────────────────────────────────────
type StepKey =
  | "domaine"
  | "email"
  | "profil"
  | "competences"
  | "projet"
  | "startup_info"
  | "besoins"
  | "company_info"
  | "besoins_rh"
  | "template";

const STEP_META: Record<StepKey, { label: string; icon: React.ElementType }> = {
  domaine: { label: "Domaine", icon: Globe },
  email: { label: "Email", icon: Mail },
  profil: { label: "Profil", icon: User },
  competences: { label: "Compétences", icon: Code2 },
  projet: { label: "Premier projet", icon: FolderOpen },
  startup_info: { label: "Ma Startup", icon: Rocket },
  besoins: { label: "Besoins", icon: Sparkles },
  company_info: { label: "Mon Entreprise", icon: Building2 },
  besoins_rh: { label: "Recrutement", icon: Briefcase },
  template: { label: "Template", icon: Layout },
};

const TYPE_STEPS: Record<Profile["type"], StepKey[]> = {
  developer: ["profil", "competences", "projet", "template"],
  startup: ["startup_info", "besoins", "template"],
  enterprise: ["company_info", "besoins_rh", "template"],
  other: ["profil", "template"],
};

function buildSteps(profile: Profile): StepKey[] {
  const steps: StepKey[] = [];

  // Show domaine step if user has a temp slug (auto-generated user-XXXX)
  if (profile.slug.startsWith("user-") && profile.slug.length <= 13) {
    steps.push("domaine");
  }

  // Show email step if user has a synthetic email
  if (profile.email.endsWith("@phone.ivoire.io")) {
    steps.push("email");
  }

  // Type-specific steps
  steps.push(...(TYPE_STEPS[profile.type] ?? TYPE_STEPS.developer));
  return steps;
}

// ─── Fallbacks ───────────────────────────────────────────────────────────────
const SUGGESTED_SKILLS_FALLBACK = [
  "React", "Next.js", "Node.js", "Python", "Flutter", "Go", "TypeScript",
  "PHP", "Laravel", "Django", "Vue.js", "Angular", "PostgreSQL", "MongoDB",
  "Docker", "AWS", "Firebase", "Figma", "TailwindCSS", "Swift",
];

const LOOKING_FOR_FALLBACK = [
  { value: "cofounders", label: "Cherche des co-fondateurs" },
  { value: "developers", label: "Cherche des développeurs" },
  { value: "investors", label: "Cherche des investisseurs" },
  { value: "customers", label: "Cherche des clients / early adopters" },
  { value: "mentors", label: "Cherche des mentors / advisors" },
  { value: "partners", label: "Cherche des partenaires business" },
];

const TEMPLATES = [
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    description: "Épuré et moderne, sur fond sombre",
    preview: { bg: "#0A0A0A", accent: "#FF6B00", card: "#111111", text: "#FFFFFF" },
  },
  {
    id: "classic-light",
    name: "Classic Light",
    description: "Professionnel et lumineux",
    preview: { bg: "#FAFAFA", accent: "#2563EB", card: "#FFFFFF", text: "#111827" },
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "Style hacker avec police monospace",
    preview: { bg: "#0D1117", accent: "#00FF41", card: "#161B22", text: "#C9D1D9" },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getExtra(profile: Profile): Record<string, string> {
  const extra = profile.registration_extra;
  if (!extra || typeof extra !== "object") return {};
  return Object.fromEntries(
    Object.entries(extra).map(([k, v]) => [k, typeof v === "string" ? v : ""])
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export function OnboardingWizard({ profile, onComplete }: OnboardingWizardProps) {
  const steps = buildSteps(profile);
  const extra = getExtra(profile);

  // Dynamic fields
  const { options: skillOpts } = useDynamicFields("skill");
  const { options: cityOpts } = useDynamicFields("city");
  const { options: sectorOpts } = useDynamicFields("sector");
  const { options: stageOpts } = useDynamicFields("stage");
  const { options: companySizeOpts } = useDynamicFields("company_size");
  const { options: lookingForOpts } = useDynamicFields("looking_for");

  const SUGGESTED_SKILLS = skillOpts.length > 0 ? skillOpts.map((s) => s.label) : SUGGESTED_SKILLS_FALLBACK;
  const CITIES = cityOpts.length > 0 ? cityOpts.map((c) => ({ value: c.label, label: c.label })) : [];
  const SECTORS = sectorOpts.length > 0 ? sectorOpts.map((s) => ({ value: s.value, label: s.label })) : [];
  const STAGES = stageOpts.length > 0 ? stageOpts.map((s) => ({ value: s.value, label: s.label })) : [];
  const COMP_SIZES = companySizeOpts.length > 0 ? companySizeOpts.map((s) => ({ value: s.value, label: s.label })) : [];
  const LOOKING_FOR = lookingForOpts.length > 0 ? lookingForOpts.map((s) => ({ value: s.value, label: s.label })) : LOOKING_FOR_FALLBACK;

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // ── Step: domaine ──
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const slugDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkSlug = useCallback(async (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (cleaned.length < 3) {
      setSlugStatus("invalid");
      return;
    }
    setSlugStatus("checking");
    try {
      const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(cleaned)}`);
      const json = await res.json();
      setSlugStatus(json.available ? "available" : "taken");
    } catch {
      // On error, show as available (will be validated server-side on save)
      setSlugStatus("available");
    }
  }, []);

  function handleSlugChange(value: string) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(cleaned);
    setSlugStatus("idle");
    if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    if (cleaned.length >= 3) {
      slugDebounceRef.current = setTimeout(() => checkSlug(cleaned), 500);
    } else if (cleaned.length > 0) {
      setSlugStatus("invalid");
    }
  }

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    };
  }, []);

  // ── Step: email ──
  const [email, setEmail] = useState("");
  const [emailOk, setEmailOk] = useState<boolean | null>(null);

  function handleEmailChange(value: string) {
    setEmail(value);
    if (!value) {
      setEmailOk(null);
    } else {
      setEmailOk(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value));
    }
  }

  // ── Step: profil ──
  const [fullName, setFullName] = useState(profile.full_name === "Utilisateur" ? "" : (profile.full_name || ""));
  const [title, setTitle] = useState(profile.title || "");
  const [city, setCity] = useState(profile.city || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Step: competences ──
  const [skills, setSkills] = useState<string[]>([...profile.skills]);

  // ── Step: projet ──
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectTech, setProjectTech] = useState("");

  // ── Step: startup_info ──
  const [startupName, setStartupName] = useState(extra.startup_name || "");
  const [tagline, setTagline] = useState(extra.tagline || "");
  const [startupSector, setStartupSector] = useState(extra.sector || "");
  const [startupStage, setStartupStage] = useState(extra.stage || "");

  // ── Step: besoins (startup) ──
  const preselectedLookingFor = (() => {
    const v = profile.registration_extra?.looking_for;
    return Array.isArray(v) ? (v as string[]) : [];
  })();
  const [lookingFor, setLookingFor] = useState<string[]>(preselectedLookingFor);

  // ── Step: company_info ──
  const [companyName, setCompanyName] = useState(extra.company_name || "");
  const [companySector, setCompanySector] = useState(extra.sector || "");
  const [companySize, setCompanySize] = useState(extra.company_size || "");

  // ── Step: besoins_rh ──
  const [hiringNeeds, setHiringNeeds] = useState(extra.hiring_needs || "");

  // ── Step: template ──
  const [selectedTemplate, setSelectedTemplate] = useState(profile.template_id || "minimal-dark");

  // ─── Avatar ─────────────────────────────────────────────────────────────────
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Seules les images sont acceptées (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 2 Mo.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  async function uploadAvatar(): Promise<boolean> {
    if (!avatarFile) return true;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", avatarFile);
      const res = await fetch("/api/dashboard/avatar", { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) { setAvatarFile(null); return true; }
      toast.error(json.error || "Erreur lors de l'upload de la photo.");
      return false;
    } catch {
      toast.error("Erreur réseau lors de l'upload.");
      return false;
    } finally {
      setAvatarUploading(false);
    }
  }

  // ─── API helpers ─────────────────────────────────────────────────────────────
  async function saveProfile(data: Record<string, unknown>): Promise<boolean> {
    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) return true;
      toast.error(json.error || "Erreur lors de la sauvegarde.");
      return false;
    } catch {
      toast.error("Erreur réseau.");
      return false;
    }
  }

  async function saveProject(): Promise<boolean> {
    if (!projectName.trim()) return true;
    try {
      const techStack = projectTech.split(",").map((t) => t.trim()).filter(Boolean);
      const res = await fetch("/api/dashboard/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName.trim(), description: projectDesc.trim() || null, tech_stack: techStack }),
      });
      const json = await res.json();
      if (json.success) return true;
      toast.error(json.error || "Erreur lors de la création du projet.");
      return false;
    } catch {
      toast.error("Erreur réseau.");
      return false;
    }
  }

  async function saveTemplate(): Promise<boolean> {
    try {
      const res = await fetch("/api/dashboard/template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: selectedTemplate }),
      });
      const json = await res.json();
      if (json.success) return true;
      toast.error(json.error || "Erreur lors du choix du template.");
      return false;
    } catch {
      toast.error("Erreur réseau.");
      return false;
    }
  }

  async function completeOnboarding(): Promise<boolean> {
    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding_completed: true }),
      });
      const json = await res.json();
      return json.success === true;
    } catch {
      return false;
    }
  }

  // ─── Step save logic ─────────────────────────────────────────────────────────
  async function handleStepSave(stepKey: StepKey): Promise<boolean> {
    switch (stepKey) {
      case "domaine":
        if (!slug || slug.length < 3) return true; // skip (keep temp slug)
        return saveProfile({ slug });

      case "email":
        if (!email) return true; // skip (keep synthetic email)
        if (!emailOk) {
          toast.error("Adresse email invalide.");
          return false;
        }
        return saveProfile({ email });

      case "profil":
        if (avatarFile) {
          const avatarOk = await uploadAvatar();
          if (!avatarOk) return false;
        }
        return saveProfile({
          full_name: fullName.trim() || undefined,
          title: title.trim() || null,
          city: city.trim() || null,
          bio: bio.trim() || null,
        });

      case "competences":
        return saveProfile({ skills });

      case "projet":
        return saveProject();

      case "startup_info":
        return saveProfile({
          registration_extra: {
            ...getExtra(profile),
            startup_name: startupName.trim(),
            tagline: tagline.trim() || null,
            sector: startupSector || null,
            stage: startupStage || null,
          },
        });

      case "besoins":
        return saveProfile({
          registration_extra: {
            ...getExtra(profile),
            startup_name: startupName,
            looking_for: lookingFor,
          },
        });

      case "company_info":
        return saveProfile({
          registration_extra: {
            ...getExtra(profile),
            company_name: companyName.trim(),
            sector: companySector || null,
            company_size: companySize || null,
          },
        });

      case "besoins_rh":
        return saveProfile({
          registration_extra: {
            ...getExtra(profile),
            company_name: companyName,
            hiring_needs: hiringNeeds.trim() || null,
          },
        });

      case "template": {
        const tOk = await saveTemplate();
        if (!tOk) return false;
        const cOk = await completeOnboarding();
        if (!cOk) { toast.error("Erreur lors de la finalisation."); return false; }
        toast.success("Onboarding terminé ! Bienvenue sur ivoire.io");
        onComplete();
        return true;
      }

      default:
        return true;
    }
  }

  async function handleNext() {
    setIsLoading(true);
    try {
      const stepKey = steps[currentStep];
      const ok = await handleStepSave(stepKey);
      if (!ok) return;
      if (stepKey === "template") return;
      setCurrentStep((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }

  function handlePrev() {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }

  const currentStepKey = steps[currentStep];
  const currentMeta = STEP_META[currentStepKey];
  const StepIcon = currentMeta.icon;
  const isLastStep = currentStep === steps.length - 1;

  const isNextDisabled =
    isLoading ||
    (currentStepKey === "domaine" && slug.length > 0 && slug.length < 3) ||
    (currentStepKey === "domaine" && slugStatus === "taken") ||
    (currentStepKey === "domaine" && slugStatus === "checking") ||
    (currentStepKey === "email" && email.length > 0 && !emailOk) ||
    (currentStepKey === "profil" && fullName.trim().length > 0 && fullName.trim().length < 2) ||
    (currentStepKey === "startup_info" && startupName.trim().length > 0 && startupName.trim().length < 2) ||
    (currentStepKey === "company_info" && companyName.trim().length > 0 && companyName.trim().length < 2);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center px-4 py-8">
        {/* Header */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10">
              <Sparkles size={20} className="text-orange-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {profile.type === "startup" ? "Configurez votre startup" :
                  profile.type === "enterprise" ? "Configurez votre entreprise" :
                    "Configurez votre profil"}
              </h1>
              <p className="text-sm text-white/50">
                Étape {currentStep + 1} sur {steps.length} — vous pouvez passer les étapes
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex gap-2">
            {steps.map((stepKey, index) => {
              const meta = STEP_META[stepKey];
              return (
                <div key={stepKey} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: index < currentStep ? "100%" : index === currentStep ? "50%" : "0%",
                        background: index <= currentStep ? "#FF6B00" : "transparent",
                      }}
                    />
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-medium transition-colors ${index <= currentStep ? "text-orange-500" : "text-white/20"
                    }`}>
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="w-full max-w-2xl flex-1">
          <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6 md:p-8">
            {/* Step header */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/[0.06]">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-500/10">
                <StepIcon size={18} className="text-orange-500" />
              </div>
              <h2 className="text-lg font-semibold text-white">{currentMeta.label}</h2>
            </div>

            {/* ── Step: domaine ── */}
            {currentStepKey === "domaine" && (
              <div className="space-y-5">
                <p className="text-sm text-white/50">
                  Choisissez votre sous-domaine personnalisé. Ce sera l&apos;adresse de votre page publique.
                </p>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Sous-domaine</label>
                  <div className="flex items-center gap-0 bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
                    <input
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="mon-nom"
                      maxLength={30}
                      className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none"
                    />
                    <span className="shrink-0 pr-4 text-sm text-white/30 font-mono">.ivoire.io</span>
                  </div>
                  {slugStatus === "checking" && (
                    <p className="text-xs text-white/40 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Vérification...</p>
                  )}
                  {slugStatus === "available" && (
                    <p className="text-xs text-green-400 flex items-center gap-1"><Check size={11} /> {slug}.ivoire.io est disponible !</p>
                  )}
                  {slugStatus === "taken" && (
                    <p className="text-xs text-red-400 flex items-center gap-1"><X size={11} /> Ce sous-domaine est déjà pris.</p>
                  )}
                  {slugStatus === "invalid" && slug.length > 0 && (
                    <p className="text-xs text-red-400 flex items-center gap-1"><X size={11} /> Minimum 3 caractères (lettres, chiffres, tirets).</p>
                  )}
                </div>
                <p className="text-xs text-white/20">Vous pouvez passer cette étape et choisir plus tard.</p>
              </div>
            )}

            {/* ── Step: email ── */}
            {currentStepKey === "email" && (
              <div className="space-y-5">
                <p className="text-sm text-white/50">
                  Ajoutez votre adresse email pour recevoir des notifications et pouvoir récupérer votre compte.
                </p>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Adresse email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                  {emailOk === false && email.length > 0 && (
                    <p className="text-xs text-red-400 flex items-center gap-1"><X size={11} /> Adresse email invalide.</p>
                  )}
                  {emailOk === true && (
                    <p className="text-xs text-green-400 flex items-center gap-1"><Check size={11} /> Format valide.</p>
                  )}
                </div>
                <p className="text-xs text-white/20">Vous pouvez passer cette étape et ajouter votre email plus tard.</p>
              </div>
            )}

            {/* ── Step: profil ── */}
            {currentStepKey === "profil" && (
              <div className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-orange-500">{fullName.charAt(0).toUpperCase() || "?"}</span>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md hover:bg-orange-600 transition-colors"
                    >
                      <Camera size={12} />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">Photo de profil</p>
                    <p className="text-xs text-white/40 mt-0.5">JPG, PNG ou WebP. Max 2 Mo.</p>
                    {avatarUploading && (
                      <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin" /> Upload en cours...
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Nom complet</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Koffi" maxLength={100}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Titre / Poste</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lead Developer, UI Designer..." maxLength={100}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Ville</label>
                  {CITIES.length > 0 ? (
                    <select value={city} onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all">
                      <option value="">Sélectionnez une ville</option>
                      {CITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  ) : (
                    <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Abidjan" maxLength={50}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Bio</label>
                    <span className="text-[10px] text-white/20">{bio.length}/300</span>
                  </div>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Décrivez-vous en quelques phrases..." rows={3} maxLength={300}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none" />
                </div>
              </div>
            )}

            {/* ── Step: competences ── */}
            {currentStepKey === "competences" && (
              <div className="space-y-5">
                <p className="text-sm text-white/50">Sélectionnez vos compétences. Vous pourrez en ajouter d&apos;autres plus tard.</p>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <button key={skill} onClick={() => setSkills((p) => p.filter((s) => s !== skill))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-500 text-xs font-medium transition-all hover:bg-orange-500/20">
                        {skill}<X size={11} />
                      </button>
                    ))}
                  </div>
                )}
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider font-medium mb-3">Suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((skill) => (
                      <button key={skill} onClick={() => setSkills((p) => [...p, skill])}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-medium transition-all hover:bg-white/10 hover:text-white hover:border-white/20">
                        <Plus size={11} />{skill}
                      </button>
                    ))}
                  </div>
                </div>
                {skills.length === 0 && <p className="text-xs text-white/20 text-center py-4">Cliquez sur une compétence pour l&apos;ajouter</p>}
              </div>
            )}

            {/* ── Step: projet ── */}
            {currentStepKey === "projet" && (
              <div className="space-y-5">
                <p className="text-sm text-white/50">Ajoutez votre premier projet. Vous pouvez passer cette étape.</p>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Nom du projet</label>
                  <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Mon super projet" maxLength={100}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Description courte</label>
                  <textarea value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} placeholder="Décrivez brièvement votre projet..." rows={3} maxLength={500}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Technologies utilisées</label>
                  <input value={projectTech} onChange={(e) => setProjectTech(e.target.value)} placeholder="React, Node.js, PostgreSQL (séparées par des virgules)"
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                  {projectTech && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {projectTech.split(",").map((t) => t.trim()).filter(Boolean).map((tech, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/60 text-[10px] font-mono">{tech}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Step: startup_info ── */}
            {currentStepKey === "startup_info" && (
              <div className="space-y-5">
                <p className="text-sm text-white/50">Donnez vie à votre startup. Ces informations seront visibles sur votre vitrine.</p>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Nom de la startup</label>
                  <input value={startupName} onChange={(e) => setStartupName(e.target.value)} placeholder="MonApp CI" maxLength={120}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Tagline</label>
                  <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="La solution qui révolutionne..." maxLength={120}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Secteur</label>
                    <select value={startupSector} onChange={(e) => setStartupSector(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all">
                      <option value="">Choisir un secteur</option>
                      {SECTORS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Stade</label>
                    <select value={startupStage} onChange={(e) => setStartupStage(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all">
                      <option value="">Choisir un stade</option>
                      {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step: besoins (startup) ── */}
            {currentStepKey === "besoins" && (
              <div className="space-y-5">
                <p className="text-sm text-white/50">Qu&apos;est-ce que vous recherchez pour votre startup ? (Plusieurs choix possibles)</p>
                <div className="flex flex-col gap-3">
                  {LOOKING_FOR.map((item) => {
                    const selected = lookingFor.includes(item.value);
                    return (
                      <button key={item.value}
                        onClick={() => setLookingFor((prev) => selected ? prev.filter((v) => v !== item.value) : [...prev, item.value])}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all ${selected ? "bg-orange-500/10 border-orange-500/40 text-orange-400" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                          }`}>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? "bg-orange-500 border-orange-500" : "border-white/20"
                          }`}>
                          {selected && <Check size={12} className="text-white" />}
                        </div>
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Step: company_info ── */}
            {currentStepKey === "company_info" && (
              <div className="space-y-5">
                <p className="text-sm text-white/50">Présentez votre entreprise. Ces informations aident les développeurs à mieux vous connaître.</p>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Nom de l&apos;entreprise</label>
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ma Société SARL" maxLength={120}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Secteur</label>
                    <select value={companySector} onChange={(e) => setCompanySector(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all">
                      <option value="">Choisir un secteur</option>
                      {SECTORS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Taille</label>
                    <select value={companySize} onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all">
                      <option value="">Choisir une taille</option>
                      {COMP_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      {COMP_SIZES.length === 0 && (
                        <>
                          <option value="1-10">1-10</option>
                          <option value="11-50">11-50</option>
                          <option value="51-200">51-200</option>
                          <option value="200+">200+</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step: besoins_rh ── */}
            {currentStepKey === "besoins_rh" && (
              <div className="space-y-5">
                <p className="text-sm text-white/50">Décrivez vos besoins en recrutement. Vous pourrez préciser votre recherche plus tard.</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Besoins en développeurs</label>
                    <span className="text-[10px] text-white/20">{hiringNeeds.length}/300</span>
                  </div>
                  <textarea value={hiringNeeds} onChange={(e) => setHiringNeeds(e.target.value)}
                    placeholder="Ex: Nous cherchons un développeur React senior pour rejoindre notre équipe produit..." rows={5} maxLength={300}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none" />
                </div>
                <p className="text-xs text-white/30 bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                  Vous pourrez créer des offres d&apos;emploi détaillées depuis votre dashboard après l&apos;onboarding.
                </p>
              </div>
            )}

            {/* ── Step: template ── */}
            {currentStepKey === "template" && (
              <div className="space-y-5">
                <p className="text-sm text-white/50">
                  {profile.type === "startup"
                    ? "Choisissez l'apparence de votre vitrine startup."
                    : profile.type === "enterprise"
                      ? "Choisissez l'apparence de votre page entreprise."
                      : "Choisissez l'apparence de votre portfolio public."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {TEMPLATES.map((template) => {
                    const isSelected = selectedTemplate === template.id;
                    return (
                      <button key={template.id} onClick={() => setSelectedTemplate(template.id)}
                        className={`relative flex flex-col rounded-xl border-2 overflow-hidden transition-all ${isSelected ? "border-orange-500 ring-1 ring-orange-500/30" : "border-white/10 hover:border-white/20"
                          }`}>
                        <div className="aspect-[4/3] p-3 flex flex-col gap-2" style={{ background: template.preview.bg }}>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full" style={{ background: template.preview.accent, opacity: 0.8 }} />
                            <div className="flex-1">
                              <div className="h-2 w-16 rounded-full" style={{ background: template.preview.text, opacity: 0.6 }} />
                              <div className="h-1.5 w-10 rounded-full mt-1" style={{ background: template.preview.text, opacity: 0.2 }} />
                            </div>
                          </div>
                          <div className="flex-1 flex gap-1.5">
                            <div className="flex-1 rounded-md" style={{ background: template.preview.card, border: `1px solid ${template.preview.text}10` }} />
                            <div className="flex-1 rounded-md" style={{ background: template.preview.card, border: `1px solid ${template.preview.text}10` }} />
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3].map((n) => (
                              <div key={n} className="h-1.5 rounded-full" style={{ width: `${20 + n * 8}px`, background: template.preview.accent, opacity: 0.3 }} />
                            ))}
                          </div>
                        </div>
                        <div className="p-3 bg-[#111111]">
                          <p className="text-xs font-medium text-white text-left">{template.name}</p>
                          <p className="text-[10px] text-white/40 text-left mt-0.5">{template.description}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="w-full max-w-2xl mt-6 flex items-center justify-between">
          <button onClick={handlePrev} disabled={currentStep === 0 || isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm font-medium transition-all hover:bg-white/5 hover:text-white disabled:opacity-0 disabled:pointer-events-none">
            <ChevronLeft size={16} /> Précédent
          </button>

          <button onClick={handleNext} disabled={isNextDisabled}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20">
            {isLoading ? (
              <><Loader2 size={16} className="animate-spin" /> Sauvegarde...</>
            ) : isLastStep ? (
              <><Check size={16} /> Terminer</>
            ) : (
              <>Suivant <ChevronRight size={16} /></>
            )}
          </button>
        </div>

        {/* Skip hints */}
        {(currentStepKey === "domaine" || currentStepKey === "email" || currentStepKey === "projet") && (
          <p className="text-xs text-white/20 mt-3">Vous pouvez passer cette étape en cliquant sur Suivant</p>
        )}
      </div>
    </div>
  );
}
