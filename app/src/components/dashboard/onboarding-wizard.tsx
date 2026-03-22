"use client";

import { useDynamicFields } from "@/hooks/use-dynamic-fields";
import type { Profile } from "@/lib/types";
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  FolderOpen,
  Layout,
  Loader2,
  Plus,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface OnboardingWizardProps {
  profile: Profile;
  onComplete: () => void;
}

const STEPS = [
  { key: "profil", label: "Profil", icon: User },
  { key: "competences", label: "Competences", icon: Code2 },
  { key: "projet", label: "Premier projet", icon: FolderOpen },
  { key: "template", label: "Template", icon: Layout },
] as const;

const SUGGESTED_SKILLS_FALLBACK = [
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Flutter",
  "Go",
  "TypeScript",
  "PHP",
  "Laravel",
  "Django",
  "Vue.js",
  "Angular",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "AWS",
  "Firebase",
  "Figma",
  "TailwindCSS",
  "Swift",
];

const TEMPLATES = [
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    description: "Epure et moderne, sur fond sombre",
    preview: {
      bg: "#0A0A0A",
      accent: "#FF6B00",
      card: "#111111",
      text: "#FFFFFF",
    },
  },
  {
    id: "classic-light",
    name: "Classic Light",
    description: "Professionnel et lumineux",
    preview: {
      bg: "#FAFAFA",
      accent: "#2563EB",
      card: "#FFFFFF",
      text: "#111827",
    },
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "Style hacker avec police monospace",
    preview: {
      bg: "#0D1117",
      accent: "#00FF41",
      card: "#161B22",
      text: "#C9D1D9",
    },
  },
];

export function OnboardingWizard({
  profile,
  onComplete,
}: OnboardingWizardProps) {
  const { options: skillOpts } = useDynamicFields("skill");
  const { options: cityOpts } = useDynamicFields("city");
  const SUGGESTED_SKILLS = skillOpts.length > 0
    ? skillOpts.map((s) => s.label)
    : SUGGESTED_SKILLS_FALLBACK;
  const CITIES = cityOpts.length > 0
    ? cityOpts.map((c) => ({ value: c.label, label: c.label }))
    : [];

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Profile
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [title, setTitle] = useState(profile.title || "");
  const [city, setCity] = useState(profile.city || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar_url || null
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Skills
  const [skills, setSkills] = useState<string[]>([...profile.skills]);

  // Step 3: Project
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectTech, setProjectTech] = useState("");

  // Step 4: Template
  const [selectedTemplate, setSelectedTemplate] = useState(
    profile.template_id || "minimal-dark"
  );

  // Avatar handling
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Seules les images sont acceptees (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas depasser 2 Mo.");
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
      const res = await fetch("/api/dashboard/avatar", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (json.success) {
        setAvatarFile(null);
        return true;
      }
      toast.error(json.error || "Erreur lors de l'upload de la photo.");
      return false;
    } catch {
      toast.error("Erreur reseau lors de l'upload.");
      return false;
    } finally {
      setAvatarUploading(false);
    }
  }

  // Skills handling
  function toggleSkill(skill: string) {
    setSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  }

  // Save profile (steps 1, 2)
  async function saveProfile(
    data: Record<string, unknown>
  ): Promise<boolean> {
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
      toast.error("Erreur reseau.");
      return false;
    }
  }

  // Save project (step 3)
  async function saveProject(): Promise<boolean> {
    if (!projectName.trim()) {
      // Project is optional, skip if empty
      return true;
    }
    try {
      const techStack = projectTech
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await fetch("/api/dashboard/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName.trim(),
          description: projectDesc.trim() || null,
          tech_stack: techStack,
        }),
      });
      const json = await res.json();
      if (json.success) return true;
      toast.error(json.error || "Erreur lors de la creation du projet.");
      return false;
    } catch {
      toast.error("Erreur reseau.");
      return false;
    }
  }

  // Save template (step 4)
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
      toast.error("Erreur reseau.");
      return false;
    }
  }

  // Complete onboarding
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

  // Handle next step
  async function handleNext() {
    setIsLoading(true);

    try {
      if (currentStep === 0) {
        // Step 1: Upload avatar + save profile info
        if (avatarFile) {
          const avatarOk = await uploadAvatar();
          if (!avatarOk) return;
        }
        const profileOk = await saveProfile({
          full_name: fullName.trim(),
          title: title.trim() || null,
          city: city.trim() || null,
          bio: bio.trim() || null,
        });
        if (!profileOk) return;
      } else if (currentStep === 1) {
        // Step 2: Save skills
        const skillsOk = await saveProfile({ skills });
        if (!skillsOk) return;
      } else if (currentStep === 2) {
        // Step 3: Save project
        const projectOk = await saveProject();
        if (!projectOk) return;
      } else if (currentStep === 3) {
        // Step 4: Save template + complete onboarding
        const templateOk = await saveTemplate();
        if (!templateOk) return;

        const completeOk = await completeOnboarding();
        if (!completeOk) {
          toast.error("Erreur lors de la finalisation.");
          return;
        }

        toast.success("Onboarding termine ! Bienvenue sur ivoire.io");
        onComplete();
        return;
      }

      setCurrentStep((prev) => Math.min(prev + 1, 3));
    } finally {
      setIsLoading(false);
    }
  }

  function handlePrev() {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }

  const StepIcon = STEPS[currentStep].icon;

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
                Configurez votre profil
              </h1>
              <p className="text-sm text-white/50">
                Etape {currentStep + 1} sur {STEPS.length}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex gap-2">
            {STEPS.map((step, index) => (
              <div key={step.key} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width:
                        index < currentStep
                          ? "100%"
                          : index === currentStep
                            ? "50%"
                            : "0%",
                      background:
                        index <= currentStep
                          ? "#FF6B00"
                          : "transparent",
                    }}
                  />
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider font-medium transition-colors ${index <= currentStep
                      ? "text-orange-500"
                      : "text-white/20"
                    }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
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
              <h2 className="text-lg font-semibold text-white">
                {STEPS[currentStep].label}
              </h2>
            </div>

            {/* Step 1: Profile */}
            {currentStep === 0 && (
              <div className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-orange-500">
                          {fullName.charAt(0).toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md hover:bg-orange-600 transition-colors"
                    >
                      <Camera size={12} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">
                      Photo de profil
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      JPG, PNG ou WebP. Max 2 Mo.
                    </p>
                    {avatarUploading && (
                      <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin" />
                        Upload en cours...
                      </p>
                    )}
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                    Nom complet <span className="text-orange-500">*</span>
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Koffi"
                    maxLength={100}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                    Titre / Poste
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Lead Developer, UI Designer..."
                    maxLength={100}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                    Ville
                  </label>
                  {CITIES.length > 0 ? (
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    >
                      <option value="">Selectionnez une ville</option>
                      {CITIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Abidjan"
                      maxLength={50}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    />
                  )}
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                      Bio
                    </label>
                    <span className="text-[10px] text-white/20">
                      {bio.length}/300
                    </span>
                  </div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Decrivez-vous en quelques phrases..."
                    rows={3}
                    maxLength={300}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Skills */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <p className="text-sm text-white/50">
                  Selectionnez vos competences. Vous pourrez en ajouter d'autres
                  plus tard.
                </p>

                {/* Selected skills */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-500 text-xs font-medium transition-all hover:bg-orange-500/20"
                      >
                        {skill}
                        <X size={11} />
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider font-medium mb-3">
                    Suggestions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_SKILLS.filter(
                      (s) => !skills.includes(s)
                    ).map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-medium transition-all hover:bg-white/10 hover:text-white hover:border-white/20"
                      >
                        <Plus size={11} />
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                {skills.length === 0 && (
                  <p className="text-xs text-white/20 text-center py-4">
                    Cliquez sur une competence pour l'ajouter
                  </p>
                )}
              </div>
            )}

            {/* Step 3: First Project */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <p className="text-sm text-white/50">
                  Ajoutez votre premier projet. Vous pourrez passer cette etape et
                  en ajouter plus tard.
                </p>

                {/* Project Name */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                    Nom du projet
                  </label>
                  <input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Mon super projet"
                    maxLength={100}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                    Description courte
                  </label>
                  <textarea
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    placeholder="Decrivez brievement votre projet..."
                    rows={3}
                    maxLength={500}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none"
                  />
                </div>

                {/* Tech Stack */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                    Technologies utilisees
                  </label>
                  <input
                    value={projectTech}
                    onChange={(e) => setProjectTech(e.target.value)}
                    placeholder="React, Node.js, PostgreSQL (separees par des virgules)"
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                  {projectTech && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {projectTech
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/60 text-[10px] font-mono"
                          >
                            {tech}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Template */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <p className="text-sm text-white/50">
                  Choisissez l'apparence de votre portfolio public.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {TEMPLATES.map((template) => {
                    const isSelected =
                      selectedTemplate === template.id;
                    return (
                      <button
                        key={template.id}
                        onClick={() =>
                          setSelectedTemplate(template.id)
                        }
                        className={`relative flex flex-col rounded-xl border-2 overflow-hidden transition-all ${isSelected
                            ? "border-orange-500 ring-1 ring-orange-500/30"
                            : "border-white/10 hover:border-white/20"
                          }`}
                      >
                        {/* Preview */}
                        <div
                          className="aspect-[4/3] p-3 flex flex-col gap-2"
                          style={{
                            background: template.preview.bg,
                          }}
                        >
                          {/* Mini avatar */}
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{
                                background:
                                  template.preview.accent,
                                opacity: 0.8,
                              }}
                            />
                            <div className="flex-1">
                              <div
                                className="h-2 w-16 rounded-full"
                                style={{
                                  background:
                                    template.preview.text,
                                  opacity: 0.6,
                                }}
                              />
                              <div
                                className="h-1.5 w-10 rounded-full mt-1"
                                style={{
                                  background:
                                    template.preview.text,
                                  opacity: 0.2,
                                }}
                              />
                            </div>
                          </div>
                          {/* Mini cards */}
                          <div className="flex-1 flex gap-1.5">
                            <div
                              className="flex-1 rounded-md"
                              style={{
                                background:
                                  template.preview.card,
                                border: `1px solid ${template.preview.text}10`,
                              }}
                            />
                            <div
                              className="flex-1 rounded-md"
                              style={{
                                background:
                                  template.preview.card,
                                border: `1px solid ${template.preview.text}10`,
                              }}
                            />
                          </div>
                          {/* Mini skill badges */}
                          <div className="flex gap-1">
                            {[1, 2, 3].map((n) => (
                              <div
                                key={n}
                                className="h-1.5 rounded-full"
                                style={{
                                  width: `${20 + n * 8}px`,
                                  background:
                                    template.preview.accent,
                                  opacity: 0.3,
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Label */}
                        <div className="p-3 bg-[#111111]">
                          <p className="text-xs font-medium text-white text-left">
                            {template.name}
                          </p>
                          <p className="text-[10px] text-white/40 text-left mt-0.5">
                            {template.description}
                          </p>
                        </div>

                        {/* Check indicator */}
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
          <button
            onClick={handlePrev}
            disabled={currentStep === 0 || isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm font-medium transition-all hover:bg-white/5 hover:text-white disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronLeft size={16} />
            Precedent
          </button>

          <button
            onClick={handleNext}
            disabled={isLoading || (currentStep === 0 && fullName.trim().length < 2)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sauvegarde...
              </>
            ) : currentStep === 3 ? (
              <>
                Terminer
                <Check size={16} />
              </>
            ) : (
              <>
                Suivant
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Skip hint for step 3 */}
        {currentStep === 2 && !projectName.trim() && (
          <p className="text-xs text-white/20 mt-3">
            Vous pouvez passer cette etape en cliquant sur Suivant
          </p>
        )}
      </div>
    </div>
  );
}
