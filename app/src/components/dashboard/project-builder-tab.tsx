"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDynamicFields } from "@/hooks/use-dynamic-fields";
import type { Profile } from "@/lib/types";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  FolderUp,
  Globe,
  Lightbulb,
  Loader2,
  Mic,
  Pencil,
  RefreshCw,
  Rocket,
  Send,
  Shield,
  Sparkles,
  Target,
  Upload,
  Users,
  Wand2,
  Zap
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Web Speech API declarations ───
/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ─── Types ───
type BuilderMode = null | "A" | "B" | "C";
type StepKey = "welcome" | "step1" | "step2" | "step3" | "step4";

interface ProjectScore {
  global: number;
  identity: { score: number; items: Record<string, boolean> };
  vision: { score: number; items: Record<string, boolean> };
  technique: { score: number; items: Record<string, boolean> };
  financier: { score: number; items: Record<string, boolean> };
  protection: { score: number; items: Record<string, boolean> };
  status: string;
  statusLabel: string;
  statusColor: string;
}

interface InterviewAnswer {
  question: string;
  answer: string;
  summary: string;
  validated: boolean;
}

interface GeneratedItem {
  key: string;
  label: string;
  icon: string;
  status: "pending" | "generating" | "done" | "error";
  result?: string;
}

interface ProjectBuilderTabProps {
  profile: Profile;
  onNavigate: (tab: string) => void;
}

// ─── Constantes (fallbacks) ───
const SECTORS_FALLBACK = [
  "Fintech", "Edtech", "Healthtech", "Agritech", "Logistique",
  "E-commerce", "SaaS", "IA", "Énergie", "Immobilier", "Médias", "Tech", "Autre",
];

const COUNTRIES_FALLBACK = [
  "Côte d'Ivoire", "Sénégal", "Mali", "Burkina Faso", "Guinée",
  "Cameroun", "Togo", "Bénin", "Niger", "Ghana", "Nigeria",
];

const INTERVIEW_QUESTIONS = [
  { key: "problem", q: "Quel problème concret ton projet résout-il ? Décris-le comme tu l'expliquerais à un ami.", icon: "🎯" },
  { key: "target", q: "Qui est exactement la personne qui a ce problème ? Âge, situation, habitudes ?", icon: "👤" },
  { key: "solution", q: "Comment ton projet résout ce problème ? Quelle est ta solution concrète ?", icon: "💡" },
  { key: "revenue", q: "Comment tu comptes gagner de l'argent avec ce projet ?", icon: "💰" },
  { key: "competitors", q: "Qui fait déjà quelque chose de similaire en Côte d'Ivoire ou ailleurs ?", icon: "🔍" },
  { key: "team", q: "Qui es-tu ? Quelle est ton expérience dans ce domaine ?", icon: "👥" },
  { key: "needs", q: "De quoi as-tu besoin pour avancer ? (Financement, développeurs, mentors...)", icon: "🛠️" },
  { key: "assets", q: "As-tu déjà un nom, un domaine, une idée de logo ou d'autres éléments ?", icon: "📦" },
];

// ─── Progress Bar ───
function ProgressBar({ value, color = "var(--color-orange)" }: { value: number; color?: string }) {
  return (
    <div className="h-2 rounded-full overflow-hidden bg-muted/50">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${Math.min(value, 100)}%`, background: color }}
      />
    </div>
  );
}

// ─── Score Category Card ───
function ScoreCategoryCard({
  title,
  icon,
  score,
  items,
  labels,
}: {
  title: string;
  icon: string;
  score: number;
  items: Record<string, boolean>;
  labels: Record<string, string>;
}) {
  const color = score >= 80 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444";
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-semibold">{title}</span>
          </div>
          <span className="text-sm font-bold" style={{ color }}>{score}%</span>
        </div>
        <ProgressBar value={score} color={color} />
        <div className="mt-3 space-y-1.5">
          {Object.entries(items).map(([key, done]) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <span className={`flex items-center justify-center w-3.5 h-3.5 rounded-full shrink-0 ${done ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                {done ? <Check className="w-2 h-2" /> : <span className="text-[8px] font-bold">!</span>}
              </span>
              <span className={done ? "text-muted-foreground" : ""}>{labels[key] || key}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Mode Selection Card ───
function ModeCard({
  icon,
  title,
  subtitle,
  description,
  onClick,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  onClick: () => void;
  gradient: string;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full text-left rounded-2xl border border-border p-6 transition-all duration-300 hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/5 hover:-translate-y-1"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: gradient }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ background: "var(--color-orange)" }}>
            {icon}
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-orange-400 transition-colors" />
        </div>
        <h3 className="text-lg font-bold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{subtitle}</p>
        <p className="text-xs text-muted-foreground/70">{description}</p>
      </div>
    </button>
  );
}

// ═══════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════
export function ProjectBuilderTab({ profile, onNavigate }: ProjectBuilderTabProps) {
  const { options: sectorOpts } = useDynamicFields("sector");
  const { options: countryOpts } = useDynamicFields("country");
  const SECTORS = sectorOpts.length > 0
    ? sectorOpts.map((s) => s.label)
    : SECTORS_FALLBACK;
  const COUNTRIES = countryOpts.length > 0
    ? countryOpts.map((c) => c.label)
    : COUNTRIES_FALLBACK;

  const [mode, setMode] = useState<BuilderMode>(null);
  const [currentStep, setCurrentStep] = useState<StepKey>("welcome");
  const [score, setScore] = useState<ProjectScore | null>(null);
  const [scoreLoading, setScoreLoading] = useState(true);

  // Mode C state
  const [ideaText, setIdeaText] = useState("");
  const [ideaSector, setIdeaSector] = useState("Fintech");
  const [ideaCountry, setIdeaCountry] = useState("Côte d'Ivoire");
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Mode B state
  const [interviewStep, setInterviewStep] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [interviewAnswers, setInterviewAnswers] = useState<InterviewAnswer[]>([]);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewMessages, setInterviewMessages] = useState<Array<{ role: "bot" | "user"; text: string }>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Mode A state
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: number; type: string; category: string; confidence: number }>>([]);
  const [classifying, setClassifying] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    identity: number;
    vision: number;
    technique: number;
    financier: number;
    global: number;
    gaps: string[];
  } | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);

  // Shared
  const [generatedTaglines, setGeneratedTaglines] = useState<string[]>([]);
  const [selectedTagline, setSelectedTagline] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  // Domain & name check results
  const [domainResults, setDomainResults] = useState<Array<{ domain: string, available: boolean }>>([]);
  const [oapiResult, setOapiResult] = useState<{ available: boolean, risques: string[] } | null>(null);
  const [domainCheckLoading, setDomainCheckLoading] = useState(false);
  const [oapiCheckLoading, setOapiCheckLoading] = useState(false);

  // Logo generation
  const [logoTaskIds, setLogoTaskIds] = useState<string[]>([]);
  const [logoUrls, setLogoUrls] = useState<string[]>([]);
  const [logoPolling, setLogoPolling] = useState(false);

  // Horodatage
  const [timestampData, setTimestampData] = useState<{ hash: string, timestamp: string } | null>(null);
  const [timestampLoading, setTimestampLoading] = useState(false);

  // Mode B document generation
  const [modeBDocStatuses, setModeBDocStatuses] = useState<Record<string, "pending" | "generating" | "done" | "error">>({});
  const [modeBDocResults, setModeBDocResults] = useState<Record<string, string>>({});

  // Fetch initial score
  useEffect(() => {
    fetch("/api/project-builder/score")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setScore(data.data);
      })
      .catch(() => { })
      .finally(() => setScoreLoading(false));
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interviewMessages]);

  // Initialize interview
  useEffect(() => {
    if (mode === "B" && currentStep === "step1" && interviewMessages.length === 0) {
      setInterviewMessages([{
        role: "bot",
        text: INTERVIEW_QUESTIONS[0].q,
      }]);
    }
  }, [mode, currentStep, interviewMessages.length]);

  function selectMode(m: BuilderMode) {
    setMode(m);
    setCurrentStep("step1");
  }

  function getStepNumber(): number {
    const map: Record<StepKey, number> = { welcome: 0, step1: 1, step2: 2, step3: 3, step4: 4 };
    return map[currentStep];
  }

  function getStepLabel(): string {
    if (mode === "A") {
      const labels: Record<StepKey, string> = { welcome: "", step1: "Import de tes fichiers", step2: "Audit IA", step3: "Complétion des gaps", step4: "Projet intégré" };
      return labels[currentStep];
    }
    if (mode === "B") {
      const labels: Record<StepKey, string> = { welcome: "", step1: "Entretien de découverte", step2: "Upload de tes éléments", step3: "Génération & Validation", step4: "Projet prêt" };
      return labels[currentStep];
    }
    const labels: Record<StepKey, string> = { welcome: "", step1: "Décris ton idée", step2: "Génération en cours", step3: "Vérifications", step4: "Projet prêt" };
    return labels[currentStep];
  }

  // ─── Interview handler (Mode B) ───
  function toggleVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setCurrentAnswer(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  async function handleInterviewSubmit() {
    if (!currentAnswer.trim()) return;
    const q = INTERVIEW_QUESTIONS[interviewStep];
    setInterviewLoading(true);
    setInterviewMessages((prev) => [...prev, { role: "user", text: currentAnswer }]);
    const answerCopy = currentAnswer;
    setCurrentAnswer("");

    try {
      const res = await fetch("/api/project-builder/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIndex: interviewStep, question: q.q, answer: answerCopy }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        if (data.data.validated) {
          setInterviewAnswers((prev) => [...prev, { question: q.q, answer: answerCopy, summary: data.data.summary, validated: true }]);
          const nextStep = interviewStep + 1;
          if (nextStep < INTERVIEW_QUESTIONS.length) {
            setInterviewStep(nextStep);
            setInterviewMessages((prev) => [
              ...prev,
              { role: "bot", text: `Parfait. ${data.data.summary}` },
              { role: "bot", text: INTERVIEW_QUESTIONS[nextStep].q },
            ]);
          } else {
            setInterviewMessages((prev) => [...prev, { role: "bot", text: "Excellent ! J'ai toutes les informations nécessaires. Passons à l'étape suivante." }]);
            setTimeout(() => setCurrentStep("step2"), 1500);
          }
        } else {
          setInterviewMessages((prev) => [...prev, { role: "bot", text: data.data.followUp || "Peux-tu préciser un peu plus ?" }]);
        }
      }
    } catch {
      setInterviewMessages((prev) => [...prev, { role: "bot", text: "Erreur de connexion. Réessaie." }]);
    } finally {
      setInterviewLoading(false);
    }
  }

  // ─── Generation handler (Mode C) ───
  async function handleGenerate() {
    if (!ideaText.trim()) { toast.error("Décris ton idée d'abord !"); return; }
    setIsGenerating(true);
    setCurrentStep("step2");

    const items: GeneratedItem[] = [
      { key: "name", label: "Nom du projet", icon: "🏷️", status: "pending" },
      { key: "tagline", label: "Tagline", icon: "✨", status: "pending" },
      { key: "desc_short", label: "Description courte", icon: "📝", status: "pending" },
      { key: "desc_long", label: "Description longue", icon: "📄", status: "pending" },
      { key: "personas", label: "Personas cibles", icon: "👥", status: "pending" },
      { key: "business_model", label: "Modèle économique", icon: "💰", status: "pending" },
      { key: "competitors", label: "Analyse concurrents", icon: "🔍", status: "pending" },
      { key: "pitch", label: "Pitch deck (10 slides)", icon: "📊", status: "pending" },
      { key: "cahier", label: "Cahier des charges", icon: "📋", status: "pending" },
      { key: "roadmap", label: "Roadmap 12 mois", icon: "🗓️", status: "pending" },
      { key: "logo", label: "Logo (3 propositions)", icon: "🎨", status: "pending" },
      { key: "domain", label: "Vérification domaine", icon: "🌐", status: "pending" },
    ];
    setGeneratedItems(items);

    // Génération progressive avec vrais appels API
    let currentProjectName = projectName || "Mon Projet";
    for (let i = 0; i < items.length; i++) {
      setGeneratedItems((prev) => prev.map((item, idx) => idx === i ? { ...item, status: "generating" } : item));
      setGenerationProgress(Math.round(((i + 0.5) / items.length) * 100));

      const itemKey = items[i].key;
      let itemStatus: "done" | "error" = "done";
      let itemResult: string | undefined;

      try {
        if (itemKey === "name") {
          const res = await fetch("/api/project-builder/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "names", projectName: currentProjectName, sector: ideaSector.toLowerCase(), description: ideaText, problem: ideaText, country: ideaCountry }),
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            currentProjectName = data.data[0] || "MonProjet";
            setProjectName(currentProjectName);
            itemResult = currentProjectName;
          }
        } else if (itemKey === "tagline") {
          const res = await fetch("/api/project-builder/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "tagline", projectName: currentProjectName, sector: ideaSector.toLowerCase(), description: ideaText, problem: ideaText, country: ideaCountry }),
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setGeneratedTaglines(data.data);
            setSelectedTagline(data.data[0] || "");
            itemResult = data.data[0];
          }
        } else if (itemKey === "desc_short") {
          const res = await fetch("/api/project-builder/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "description_short", projectName: currentProjectName, sector: ideaSector.toLowerCase(), description: ideaText, problem: ideaText, country: ideaCountry }),
          });
          const data = await res.json();
          if (data.success && data.data) {
            setProjectDescription(typeof data.data === "string" ? data.data : JSON.stringify(data.data));
            itemResult = typeof data.data === "string" ? data.data.slice(0, 80) + "..." : undefined;
          }
        } else if (itemKey === "personas") {
          const res = await fetch("/api/project-builder/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "personas", projectName: currentProjectName, sector: ideaSector.toLowerCase(), description: ideaText, problem: ideaText, country: ideaCountry }),
          });
          const data = await res.json();
          if (data.success) {
            itemResult = "Personas generees";
          }
        } else if (itemKey === "desc_long") {
          const res = await fetch("/api/project-builder/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "description_long", projectName: currentProjectName, sector: ideaSector.toLowerCase(), problem: ideaText, solution: ideaText, country: ideaCountry }),
          });
          const data = await res.json();
          if (data.success) {
            itemResult = typeof data.data === "string" ? data.data.slice(0, 80) + "..." : "Description longue generee";
          }
        } else if (itemKey === "business_model") {
          const res = await fetch("/api/project-builder/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "business_plan", projectName: currentProjectName, sector: ideaSector.toLowerCase(), problem: ideaText, solution: ideaText, country: ideaCountry }),
          });
          const data = await res.json();
          if (data.success) {
            itemResult = "Business plan genere";
          }
        } else if (itemKey === "competitors") {
          const res = await fetch("/api/project-builder/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "competitors", projectName: currentProjectName, sector: ideaSector.toLowerCase(), problem: ideaText, country: ideaCountry }),
          });
          const data = await res.json();
          if (data.success) {
            itemResult = "Analyse concurrents generee";
          }
        } else if (itemKey === "pitch") {
          const res = await fetch("/api/project-builder/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "pitch_deck", projectName: currentProjectName, sector: ideaSector.toLowerCase(), problem: ideaText, solution: ideaText, country: ideaCountry }),
          });
          const data = await res.json();
          if (data.success) {
            itemResult = "Pitch deck genere (10 slides)";
          }
        } else if (itemKey === "cahier") {
          const res = await fetch("/api/project-builder/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "cahier_charges", projectName: currentProjectName, sector: ideaSector.toLowerCase(), problem: ideaText, solution: ideaText, country: ideaCountry }),
          });
          const data = await res.json();
          if (data.success) {
            itemResult = "Cahier des charges genere";
          }
        } else if (itemKey === "roadmap") {
          const res = await fetch("/api/project-builder/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "roadmap", projectName: currentProjectName, sector: ideaSector.toLowerCase(), problem: ideaText, solution: ideaText, country: ideaCountry }),
          });
          const data = await res.json();
          if (data.success) {
            itemResult = "Roadmap 12 mois generee";
          }
        } else if (itemKey === "logo") {
          const res = await fetch("/api/project-builder/logo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectName: currentProjectName, sector: ideaSector.toLowerCase(), country: ideaCountry }),
          });
          const data = await res.json();
          if (data.success && data.data?.tasks) {
            const taskIds = data.data.tasks.map((t: { taskId: string }) => t.taskId).filter(Boolean);
            setLogoTaskIds(taskIds);
            itemResult = `${taskIds.length} logo(s) en cours de generation`;
          }
        } else if (itemKey === "domain") {
          const baseName = currentProjectName.toLowerCase().replace(/\s+/g, "");
          const extensions = [".ci", ".io", ".com"];
          const results: Array<{ domain: string, available: boolean }> = [];
          for (const ext of extensions) {
            try {
              const res = await fetch("/api/project-builder/domain-check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain: baseName + ext }),
              });
              const data = await res.json();
              if (data.success) {
                results.push({ domain: data.data.domain, available: data.data.available });
              }
            } catch {
              results.push({ domain: baseName + ext, available: false });
            }
          }
          setDomainResults(results);
          const availableCount = results.filter(r => r.available).length;
          itemResult = `${availableCount}/${results.length} domaine(s) disponible(s)`;
        }
      } catch {
        itemStatus = "error";
      }

      setGeneratedItems((prev) => prev.map((item, idx) => idx === i ? { ...item, status: itemStatus, result: itemResult } : item));
      setGenerationProgress(Math.round(((i + 1) / items.length) * 100));
    }

    setIsGenerating(false);
    setTimeout(() => setCurrentStep("step3"), 1000);
  }

  // ─── File upload handler (Mode A) ───
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setClassifying(true);

    const newFiles: typeof uploadedFiles = [];
    for (const file of Array.from(files)) {
      try {
        const res = await fetch("/api/project-builder/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, fileType: file.type, fileSize: file.size }),
        });
        const data = await res.json();
        newFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          category: data.data?.category || "autre",
          confidence: data.data?.confidence || 0.5,
        });
      } catch {
        newFiles.push({ name: file.name, size: file.size, type: file.type, category: "autre", confidence: 0.3 });
      }
    }

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setClassifying(false);
    toast.success(`${newFiles.length} fichier(s) classifié(s)`);
  }

  // ─── Audit IA (Mode A) ───
  async function handleAudit() {
    setAuditLoading(true);
    // Simuler l'audit basé sur les fichiers uploadés
    await new Promise((r) => setTimeout(r, 2000));
    const hasLogo = uploadedFiles.some((f) => f.category === "logo");
    const hasPitch = uploadedFiles.some((f) => f.category === "pitch_deck");
    const hasBP = uploadedFiles.some((f) => f.category === "business_plan");
    const hasCharte = uploadedFiles.some((f) => f.category === "charte_graphique");
    const hasCahier = uploadedFiles.some((f) => f.category === "cahier_charges");

    const identity = (hasLogo ? 40 : 0) + (hasCharte ? 30 : 0) + 20; // nom toujours présent
    const vision = (hasPitch ? 40 : 0) + 15;
    const technique = hasCahier ? 50 : 10;
    const financier = hasBP ? 70 : 10;
    const global = Math.round(identity * 0.25 + vision * 0.25 + technique * 0.2 + financier * 0.2 + 5 * 0.1);

    const gaps: string[] = [];
    if (!hasLogo) gaps.push("Logo");
    if (!hasPitch) gaps.push("Pitch deck");
    if (!hasBP) gaps.push("Business plan");
    if (!hasCahier) gaps.push("Cahier des charges");
    gaps.push("Personas", "Analyse concurrents");

    setAuditResult({ identity, vision, technique, financier, global, gaps });
    setAuditLoading(false);
    setCurrentStep("step2");
  }

  // ─── Mode B: Generate documents after interview ───
  async function handleGenerateDocuments() {
    const docTypes = [
      { key: "desc_short", label: "Description courte", type: "description_short" },
      { key: "logo", label: "Logo — 3 propositions", type: "logo" },
      { key: "domain", label: "Nom de domaine", type: "domain" },
      { key: "pitch", label: "Pitch deck 10 slides", type: "pitch_deck" },
      { key: "cahier", label: "Cahier des charges", type: "cahier_charges" },
      { key: "competitors", label: "Analyse concurrents", type: "competitors" },
    ];

    // Initialize all to pending
    const initialStatuses: Record<string, "pending" | "generating" | "done" | "error"> = {};
    for (const d of docTypes) initialStatuses[d.key] = "pending";
    setModeBDocStatuses(initialStatuses);

    // Get context from interview answers
    const problemAnswer = interviewAnswers.find(a => a.question.includes("problème"))?.answer || "";
    const solutionAnswer = interviewAnswers.find(a => a.question.includes("solution"))?.answer || "";
    const targetAnswer = interviewAnswers.find(a => a.question.includes("personne"))?.answer || "";
    const description = [problemAnswer, solutionAnswer, targetAnswer].filter(Boolean).join(". ");

    for (const doc of docTypes) {
      setModeBDocStatuses(prev => ({ ...prev, [doc.key]: "generating" }));

      try {
        if (doc.type === "logo") {
          const res = await fetch("/api/project-builder/logo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectName: projectName || "MonProjet", sector: ideaSector.toLowerCase(), country: ideaCountry }),
          });
          const data = await res.json();
          if (data.success && data.data?.tasks) {
            const taskIds = data.data.tasks.map((t: { taskId: string }) => t.taskId).filter(Boolean);
            setLogoTaskIds(taskIds);
          }
          setModeBDocStatuses(prev => ({ ...prev, [doc.key]: "done" }));
        } else if (doc.type === "domain") {
          const baseName = (projectName || "monprojet").toLowerCase().replace(/\s+/g, "");
          const extensions = [".ci", ".io", ".com"];
          const results: Array<{ domain: string, available: boolean }> = [];
          for (const ext of extensions) {
            try {
              const res = await fetch("/api/project-builder/domain-check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain: baseName + ext }),
              });
              const data = await res.json();
              if (data.success) results.push({ domain: data.data.domain, available: data.data.available });
            } catch {
              results.push({ domain: baseName + ext, available: false });
            }
          }
          setDomainResults(results);
          setModeBDocStatuses(prev => ({ ...prev, [doc.key]: "done" }));
          setModeBDocResults(prev => ({ ...prev, [doc.key]: `${results.filter(r => r.available).length} domaine(s) disponible(s)` }));
        } else {
          const res = await fetch("/api/project-builder/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: doc.type,
              projectName: projectName || "MonProjet",
              sector: ideaSector.toLowerCase(),
              description,
              problem: problemAnswer || description,
              solution: solutionAnswer || description,
              country: ideaCountry,
            }),
          });
          const data = await res.json();
          if (data.success) {
            setModeBDocStatuses(prev => ({ ...prev, [doc.key]: "done" }));
            const preview = typeof data.data === "string" ? data.data.slice(0, 100) : "";
            setModeBDocResults(prev => ({ ...prev, [doc.key]: preview }));
          } else {
            setModeBDocStatuses(prev => ({ ...prev, [doc.key]: "error" }));
          }
        }
      } catch {
        setModeBDocStatuses(prev => ({ ...prev, [doc.key]: "error" }));
      }
    }
  }

  // ─── Domain check ───
  async function handleDomainCheck() {
    setDomainCheckLoading(true);
    const baseName = (projectName || "monprojet").toLowerCase().replace(/\s+/g, "");
    const extensions = [".ci", ".io", ".com"];
    const results: Array<{ domain: string, available: boolean }> = [];
    for (const ext of extensions) {
      try {
        const res = await fetch("/api/project-builder/domain-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: baseName + ext }),
        });
        const data = await res.json();
        if (data.success) results.push({ domain: data.data.domain, available: data.data.available });
        else results.push({ domain: baseName + ext, available: false });
      } catch {
        results.push({ domain: baseName + ext, available: false });
      }
    }
    setDomainResults(results);
    setDomainCheckLoading(false);
  }

  // ─── OAPI name check ───
  async function handleOapiCheck() {
    setOapiCheckLoading(true);
    try {
      const res = await fetch("/api/project-builder/name-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName || "MonProjet" }),
      });
      const data = await res.json();
      if (data.success) {
        setOapiResult({ available: data.data.available, risques: data.data.risques || [] });
      }
    } catch {
      toast.error("Erreur lors de la verification OAPI.");
    } finally {
      setOapiCheckLoading(false);
    }
  }

  // ─── Export handler ───
  async function handleExport(type: string) {
    try {
      const res = await fetch("/api/project-builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          projectName: projectName || "MonProjet",
          sector: ideaSector.toLowerCase(),
          problem: ideaText || projectDescription,
          solution: ideaText || projectDescription,
          country: ideaCountry,
        }),
      });
      if (!res.ok) throw new Error("Export failed");
      const data = await res.json();
      if (data.success && data.data) {
        // Create downloadable text file from the generated content
        const content = typeof data.data === "string" ? data.data : JSON.stringify(data.data, null, 2);
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ivoire-io-${type}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Document telecharge !");
      } else {
        throw new Error("No data returned");
      }
    } catch {
      toast.error("Erreur lors de l'export.");
    }
  }

  // ─── Timestamp handler ───
  async function handleTimestamp() {
    setTimestampLoading(true);
    try {
      const res = await fetch("/api/project-builder/timestamp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTimestampData({ hash: data.data.hash, timestamp: data.data.timestamp });
        toast.success("Projet horodate avec succes !");
      } else {
        toast.error(data.error || "Erreur lors de l'horodatage.");
      }
    } catch {
      toast.error("Erreur lors de l'horodatage.");
    } finally {
      setTimestampLoading(false);
    }
  }

  // ─── Poll logo status ───
  async function pollLogoStatus() {
    if (logoTaskIds.length === 0) return;
    setLogoPolling(true);
    try {
      const res = await fetch(`/api/project-builder/logo?taskIds=${logoTaskIds.join(",")}`);
      const data = await res.json();
      if (data.success && data.data?.results) {
        const urls: string[] = [];
        for (const result of data.data.results) {
          if (result.status === "completed" && result.output?.image_url) {
            urls.push(result.output.image_url);
          } else if (result.status === "completed" && result.output?.url) {
            urls.push(result.output.url);
          } else if (result.image_url) {
            urls.push(result.image_url);
          }
        }
        if (urls.length > 0) setLogoUrls(urls);
      }
    } catch {
      // silently fail
    } finally {
      setLogoPolling(false);
    }
  }

  // ═══════════════════════════════
  // RENDU
  // ═══════════════════════════════

  // ─── WELCOME (choix du mode) ───
  if (currentStep === "welcome") {
    return (
      <div className="flex flex-col gap-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 mb-6">
            <Sparkles className="w-4 h-4" style={{ color: "var(--color-orange)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--color-orange)" }}>Nouveau</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">Project Builder</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Bienvenue ! Commençons à construire ton projet. Dis-nous où tu en es :
          </p>
        </div>

        {/* Score actuel si existant */}
        {!scoreLoading && score && score.global > 0 && (
          <Card className="border-orange-500/20 bg-orange-500/5">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: score.statusColor + "20", color: score.statusColor }}>
                {score.global}%
              </div>
              <div className="flex-1">
                <p className="font-semibold">Ton projet est déjà à {score.global}%</p>
                <p className="text-sm text-muted-foreground">{score.statusLabel} — Continue pour compléter les éléments manquants</p>
              </div>
              <Badge style={{ background: score.statusColor + "20", color: score.statusColor, border: "none" }}>
                {score.statusLabel}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Mode cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ModeCard
            icon={<FolderUp className="w-6 h-6" />}
            title="MODE A — J'ai déjà tout"
            subtitle="Logo, pitch, domaine, documents..."
            description="J'uploade mes fichiers existants. L'IA audite et complète ce qui manque. ~5-10 min"
            onClick={() => selectMode("A")}
            gradient="linear-gradient(135deg, rgba(249,115,22,0.03) 0%, transparent 100%)"
          />
          <ModeCard
            icon={<Pencil className="w-6 h-6" />}
            title="MODE B — J'ai l'idée + quelques éléments"
            subtitle="Nom, quelques notes, esquisse..."
            description="On construit ensemble ce qui manque via un entretien guidé par l'IA. ~15-25 min"
            onClick={() => selectMode("B")}
            gradient="linear-gradient(135deg, rgba(59,130,246,0.03) 0%, transparent 100%)"
          />
          <ModeCard
            icon={<Lightbulb className="w-6 h-6" />}
            title="MODE C — J'ai juste l'idée"
            subtitle="Je décris, l'IA génère tout."
            description="Logo, pitch, domaine, documents complets. Projet 100% prêt en ~10-15 min"
            onClick={() => selectMode("C")}
            gradient="linear-gradient(135deg, rgba(168,85,247,0.03) 0%, transparent 100%)"
          />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Résultat garanti : projet 100% prêt pour les financiers, présentable au grand public, protégé.
        </p>
      </div>
    );
  }

  // ─── STEP HEADER (commun) ───
  const stepNumber = getStepNumber();
  const stepLabel = getStepLabel();
  const modeLabels: Record<string, string> = { A: "Import", B: "Guidé", C: "Génération" };
  const modeIcons: Record<string, React.ReactNode> = {
    A: <FolderUp className="w-4 h-4" />,
    B: <Pencil className="w-4 h-4" />,
    C: <Lightbulb className="w-4 h-4" />,
  };

  const StepHeader = (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (currentStep === "step1") { setMode(null); setCurrentStep("welcome"); }
            else {
              const steps: StepKey[] = ["welcome", "step1", "step2", "step3", "step4"];
              const idx = steps.indexOf(currentStep);
              if (idx > 0) setCurrentStep(steps[idx - 1]);
            }
          }}
          className="p-2 rounded-lg border border-border hover:border-orange-400/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          {mode && modeIcons[mode]}
          <span className="text-sm font-medium text-muted-foreground">Mode {mode} — {modeLabels[mode || ""]}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Étape {stepNumber} / 4</span>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold">{stepLabel}</h2>
      </div>
      <ProgressBar value={stepNumber * 25} />
    </div>
  );

  // ═══════════════════════════════
  // MODE A — Upload & Intégration
  // ═══════════════════════════════
  if (mode === "A") {
    if (currentStep === "step1") {
      return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {StepHeader}
          <p className="text-muted-foreground">Dépose tout ce que tu as. On classe automatiquement.</p>

          {/* Drop zone */}
          <label className="relative flex flex-col items-center justify-center gap-4 p-12 rounded-2xl border-2 border-dashed border-border hover:border-orange-400/50 transition-colors cursor-pointer" style={{ background: "var(--color-surface)" }}>
            <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Upload className="w-8 h-8" style={{ color: "var(--color-orange)" }} />
            </div>
            <div className="text-center">
              <p className="font-semibold">Glisser-déposer tes fichiers ici</p>
              <p className="text-sm text-muted-foreground mt-1">ou cliquer pour parcourir</p>
            </div>
            <p className="text-xs text-muted-foreground">PDF, DOCX, PNG, JPG, SVG — Max 50 Mo par fichier</p>
            <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} accept=".pdf,.docx,.png,.jpg,.jpeg,.svg,.txt,.xlsx" />
          </label>

          {classifying && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Classification IA en cours...
            </div>
          )}

          {/* Classified files */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Fichiers détectés & classés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.map((file, i) => {
                    const categoryLabels: Record<string, string> = {
                      logo: "Logo", pitch_deck: "Pitch deck", business_plan: "Business plan",
                      cahier_charges: "Cahier des charges", charte_graphique: "Charte graphique",
                      document_equipe: "Document équipe", analyse_marche: "Analyse marché", autre: "Non reconnu",
                    };
                    const categoryIcons: Record<string, string> = {
                      logo: "🎨", pitch_deck: "📊", business_plan: "💰",
                      cahier_charges: "📋", charte_graphique: "🎨",
                      document_equipe: "👥", analyse_marche: "🔍", autre: "❓",
                    };
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <span>{categoryIcons[file.category] || "📄"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} Ko</p>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {categoryLabels[file.category] || file.category}
                        </Badge>
                        {file.confidence >= 0.7 ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                          <span className="text-xs text-yellow-500 shrink-0">À vérifier</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleAudit}
              disabled={uploadedFiles.length === 0 || auditLoading}
              style={{ background: "var(--color-orange)", color: "#fff" }}
              className="min-w-[200px]"
            >
              {auditLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
              Suivant — Audit IA
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      );
    }

    if (currentStep === "step2" && auditResult) {
      return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {StepHeader}
          <p className="text-muted-foreground">L'IA a examiné chaque document. Voici le rapport.</p>

          {/* Score global */}
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4" style={{ borderColor: auditResult.global >= 60 ? "#22c55e" : "#eab308", color: auditResult.global >= 60 ? "#22c55e" : "#eab308" }}>
                  {auditResult.global}%
                </div>
                <div>
                  <h3 className="text-xl font-bold">Score global du projet</h3>
                  <p className="text-muted-foreground mt-1">
                    {auditResult.global >= 80 ? "Excellent ! Ton projet est presque complet." :
                      auditResult.global >= 50 ? "Bon début. Quelques éléments à compléter." :
                        "Le projet a besoin de plus de contenu."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scores par catégorie */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Identité", icon: "🎨", score: auditResult.identity },
              { title: "Vision", icon: "🎯", score: auditResult.vision },
              { title: "Technique", icon: "🔧", score: auditResult.technique },
              { title: "Financier", icon: "💰", score: auditResult.financier },
            ].map((cat) => (
              <Card key={cat.title}>
                <CardContent className="p-4 text-center">
                  <span className="text-2xl">{cat.icon}</span>
                  <p className="text-sm font-semibold mt-2">{cat.title}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: cat.score >= 60 ? "#22c55e" : cat.score >= 40 ? "#eab308" : "#ef4444" }}>
                    {cat.score}%
                  </p>
                  <ProgressBar value={cat.score} color={cat.score >= 60 ? "#22c55e" : cat.score >= 40 ? "#eab308" : "#ef4444"} />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gaps */}
          {auditResult.gaps.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Éléments manquants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {auditResult.gaps.map((gap) => (
                    <div key={gap} className="flex items-center gap-3 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                      <span className="text-red-400 text-sm">✕</span>
                      <span className="text-sm flex-1">{gap}</span>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Bot className="w-3 h-3 mr-1" /> Générer IA
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep("step1")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
            <Button onClick={() => setCurrentStep("step4")} style={{ background: "var(--color-orange)", color: "#fff" }}>
              Finaliser le projet <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      );
    }
  }

  // ═══════════════════════════════
  // MODE B — Construction guidée
  // ═══════════════════════════════
  if (mode === "B") {
    if (currentStep === "step1") {
      return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {StepHeader}
          <p className="text-muted-foreground">L'IA te pose 8 questions. Réponds librement. Durée estimée : 5 à 10 minutes.</p>

          {/* Progress indicators */}
          <div className="flex items-center gap-2">
            {INTERVIEW_QUESTIONS.map((q, i) => (
              <div key={q.key} className="flex items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${i < interviewStep ? "bg-green-500 text-white" :
                    i === interviewStep ? "text-white" :
                      "bg-muted text-muted-foreground"
                    }`}
                  style={i === interviewStep ? { background: "var(--color-orange)" } : undefined}
                >
                  {i < interviewStep ? <Check className="w-3 h-3" /> : q.icon}
                </div>
                {i < INTERVIEW_QUESTIONS.length - 1 && (
                  <div className={`w-4 h-0.5 ${i < interviewStep ? "bg-green-500" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Chat area */}
          <Card className="overflow-hidden flex-1">
            <CardContent className="p-0">
              <div className="h-[400px] overflow-y-auto p-6 space-y-4" style={{ background: "var(--color-surface)" }}>
                {interviewMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "bot" && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--color-orange)" }}>
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user"
                        ? "bg-orange-500 text-white rounded-br-md"
                        : "bg-background border border-border rounded-bl-md"
                        }`}
                    >
                      {msg.text}
                    </div>
                    {msg.role === "user" && (
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="text-xs" style={{ background: "var(--color-surface)", color: "var(--color-orange)" }}>
                          {profile.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {interviewLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--color-orange)" }}>
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-background border border-border rounded-2xl rounded-bl-md px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-border p-4">
                <div className="flex gap-3">
                  <Input
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleInterviewSubmit(); } }}
                    placeholder="Ta réponse..."
                    disabled={interviewLoading || interviewStep >= INTERVIEW_QUESTIONS.length}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant={isListening ? "destructive" : "outline"}
                    size="icon"
                    onClick={toggleVoiceInput}
                    title={isListening ? "Arrêter" : "Dicter"}
                  >
                    {isListening ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={handleInterviewSubmit}
                    disabled={!currentAnswer.trim() || interviewLoading || interviewStep >= INTERVIEW_QUESTIONS.length}
                    size="icon"
                    style={{ background: "var(--color-orange)", color: "#fff" }}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Question {interviewStep + 1} / {INTERVIEW_QUESTIONS.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (currentStep === "step2") {
      return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {StepHeader}
          <p className="text-muted-foreground">Uploade ce que tu as déjà — même partiel, même brouillon.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: "🎨", label: "Logo / esquisse", key: "logo" },
              { icon: "📝", label: "Notes / idées", key: "notes" },
              { icon: "🌐", label: "Nom de domaine", key: "domain" },
              { icon: "📸", label: "Photos équipe", key: "photos" },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-4 p-5 rounded-xl border border-border hover:border-orange-400/30 transition-colors cursor-pointer" style={{ background: "var(--color-surface)" }}>
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">Choisir un fichier</p>
                </div>
                <input type="file" className="hidden" />
                <Button size="sm" variant="outline" className="text-xs" type="button">Parcourir</Button>
              </label>
            ))}
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Tu peux tout passer — l'IA génère ce qui manque.
          </p>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep("step1")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
            <Button onClick={() => setCurrentStep("step3")} style={{ background: "var(--color-orange)", color: "#fff" }}>
              Générer les documents <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      );
    }

    if (currentStep === "step3") {
      const modeBDocs = [
        { key: "desc_short", icon: "📄", label: "Description courte" },
        { key: "logo", icon: "🎨", label: "Logo — 3 propositions" },
        { key: "domain", icon: "🌐", label: "Nom de domaine" },
        { key: "pitch", icon: "📊", label: "Pitch deck 10 slides" },
        { key: "cahier", icon: "📋", label: "Cahier des charges" },
        { key: "competitors", icon: "🔍", label: "Analyse concurrents" },
      ];
      const hasStartedGeneration = Object.keys(modeBDocStatuses).length > 0;

      return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {StepHeader}
          <p className="text-muted-foreground">L'IA génère chaque document. Tu valides ou modifies.</p>

          {!hasStartedGeneration && (
            <div className="flex justify-center">
              <Button onClick={handleGenerateDocuments} style={{ background: "var(--color-orange)", color: "#fff" }} className="min-w-[250px]">
                <Wand2 className="w-4 h-4 mr-2" /> Lancer la génération des documents
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {modeBDocs.map((item) => {
              const status = modeBDocStatuses[item.key] || "pending";
              const preview = modeBDocResults[item.key] || "";
              return (
                <Card key={item.key}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{item.label}</p>
                        {preview && <p className="text-xs text-muted-foreground mt-1">&quot;{preview}&quot;</p>}
                      </div>
                      {status === "done" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            <Check className="w-3 h-3 mr-1" /> Valider
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs">
                            <Pencil className="w-3 h-3 mr-1" /> Modifier
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs">
                            <RefreshCw className="w-3 h-3 mr-1" /> Regénérer
                          </Button>
                        </div>
                      )}
                      {status === "generating" && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" /> En cours...
                        </div>
                      )}
                      {status === "pending" && (
                        <Badge variant="outline" className="text-xs">En attente</Badge>
                      )}
                      {status === "error" && (
                        <span className="text-xs text-red-400">Erreur</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep("step2")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
            <Button onClick={() => setCurrentStep("step4")} style={{ background: "var(--color-orange)", color: "#fff" }}>
              Finaliser le projet <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      );
    }
  }

  // ═══════════════════════════════
  // MODE C — Génération complète
  // ═══════════════════════════════
  if (mode === "C") {
    if (currentStep === "step1") {
      return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {StepHeader}
          <p className="text-muted-foreground">Parle librement. Pas besoin d'être structuré.</p>

          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Ton idée en quelques mots</Label>
                <Textarea
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  placeholder="Je veux créer une application qui permet aux petits commerçants d'Abidjan de gérer leurs stocks et ventes depuis leur téléphone..."
                  rows={5}
                  className="text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Secteur *</Label>
                  <select
                    value={ideaSector}
                    onChange={(e) => setIdeaSector(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:border-orange-400 focus:outline-none"
                  >
                    {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Pays cible *</Label>
                  <select
                    value={ideaCountry}
                    onChange={(e) => setIdeaCountry(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:border-orange-400 focus:outline-none"
                  >
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground text-center">
            L'IA va construire ton projet complet. Cela prend environ 2 à 3 minutes.
          </p>

          <div className="flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={!ideaText.trim()}
              size="lg"
              className="min-w-[280px] h-12 text-base"
              style={{ background: "var(--color-orange)", color: "#fff" }}
            >
              <Rocket className="w-5 h-5 mr-2" />
              Lancer la génération
            </Button>
          </div>
        </div>
      );
    }

    if (currentStep === "step2") {
      return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {StepHeader}
          <p className="text-muted-foreground">L'IA construit ton projet...</p>

          {/* Progress */}
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold">{generationProgress}% complété</span>
                {isGenerating && <Loader2 className="w-4 h-4 animate-spin text-orange-500" />}
              </div>
              <ProgressBar value={generationProgress} />
            </CardContent>
          </Card>

          {/* Items */}
          <div className="space-y-3">
            {generatedItems.map((item) => (
              <div key={item.key} className="flex items-center gap-4 p-4 rounded-xl border border-border" style={{ background: item.status === "generating" ? "var(--color-surface)" : undefined }}>
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  {item.result && <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.result}</p>}
                </div>
                {item.status === "done" && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                {item.status === "generating" && <Loader2 className="w-5 h-5 animate-spin shrink-0" style={{ color: "var(--color-orange)" }} />}
                {item.status === "pending" && <span className="text-xs text-muted-foreground">En attente</span>}
                {item.status === "error" && <span className="text-xs text-red-400">Erreur</span>}
              </div>
            ))}
          </div>

          {!isGenerating && generationProgress >= 100 && (
            <div className="flex justify-center">
              <Button onClick={() => setCurrentStep("step3")} style={{ background: "var(--color-orange)", color: "#fff" }}>
                Continuer <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (currentStep === "step3") {
      return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {StepHeader}
          <p className="text-muted-foreground">Vérifications légales & domaine</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom du projet */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Nom du projet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-lg font-bold">&quot;{projectName || "MonProjet"}&quot;</p>
                <div className="space-y-2 text-sm">
                  {oapiResult ? (
                    <>
                      <div className="flex items-center gap-2">
                        {oapiResult.available ? (
                          <><CheckCircle2 className="w-4 h-4 text-green-500" /> OAPI — Disponible</>
                        ) : (
                          <><span className="text-red-400 text-xs">X</span> OAPI — Nom deja utilise</>
                        )}
                      </div>
                      {oapiResult.risques.length > 0 && (
                        <div className="space-y-1 ml-6">
                          {oapiResult.risques.map((r, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-yellow-500">
                              <span>--</span> {r}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Button size="sm" variant="outline" className="text-xs" onClick={handleOapiCheck} disabled={oapiCheckLoading}>
                      {oapiCheckLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Shield className="w-3 h-3 mr-1" />}
                      Verifier disponibilite OAPI
                    </Button>
                  )}
                  <div className="flex items-center gap-2"><span className="text-yellow-500 text-xs">--</span> Réseaux sociaux — À vérifier manuellement</div>
                </div>
              </CardContent>
            </Card>

            {/* Domaine */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Domaine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {domainResults.length > 0 ? (
                  domainResults.map((dr) => (
                    <div
                      key={dr.domain}
                      className={`flex items-center justify-between p-2 rounded-lg border ${dr.available ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}
                    >
                      <span>{dr.domain}</span>
                      <span className={`text-xs ${dr.available ? "text-green-500" : "text-red-400"}`}>
                        {dr.available ? "Disponible" : "Pris"}
                      </span>
                    </div>
                  ))
                ) : (
                  <Button size="sm" variant="outline" className="text-xs w-full" onClick={handleDomainCheck} disabled={domainCheckLoading}>
                    {domainCheckLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Globe className="w-3 h-3 mr-1" />}
                    Verifier la disponibilite des domaines
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Logo preview */}
          {logoUrls.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Logos generes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {logoUrls.map((url, idx) => (
                    <div key={idx} className="aspect-square rounded-xl border border-border overflow-hidden bg-white flex items-center justify-center">
                      <img src={url} alt={`Logo proposition ${idx + 1}`} className="w-full h-full object-contain p-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {logoTaskIds.length > 0 && logoUrls.length === 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Logos</CardTitle>
              </CardHeader>
              <CardContent>
                <Button size="sm" variant="outline" onClick={pollLogoStatus} disabled={logoPolling}>
                  {logoPolling ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                  Charger les logos generes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Risques */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" /> Risques identifiés
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {oapiResult && oapiResult.risques.length > 0 ? (
                oapiResult.risques.map((r, idx) => (
                  <div key={idx} className="flex items-center gap-2"><span className="text-yellow-500">--</span> {r}</div>
                ))
              ) : (
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Aucun risque majeur identifie</div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep("step2")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
            <Button onClick={() => setCurrentStep("step4")} style={{ background: "var(--color-orange)", color: "#fff" }}>
              Finaliser <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      );
    }
  }

  // ═══════════════════════════════
  // STEP 4 — Écran final (commun)
  // ═══════════════════════════════
  if (currentStep === "step4") {
    const now = new Date();
    const timestamp = now.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) + " — " + now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) + " UTC";

    return (
      <div className="flex flex-col gap-8 max-w-4xl mx-auto">
        {StepHeader}

        {/* Hero */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Ton projet est prêt !</h2>
          <p className="text-muted-foreground">Dossier complet, horodaté et protégé sur ivoire.io</p>
        </div>

        {/* Récapitulatif */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Nom</span><p className="font-semibold">{projectName || profile.full_name}</p></div>
              <div><span className="text-muted-foreground">Domaine</span><p className="font-semibold">{profile.slug}.ivoire.io</p></div>
              <div><span className="text-muted-foreground">Horodatage</span><p className="font-semibold text-xs">{timestamp}</p></div>
              <div><span className="text-muted-foreground">Score</span>
                <div className="flex items-center gap-2">
                  <ProgressBar value={score?.global ?? 72} />
                  <span className="font-bold">{score?.global ?? 72}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score par catégorie */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { title: "Identité", icon: "🎨", score: score?.identity.score ?? 100 },
            { title: "Vision", icon: "🎯", score: score?.vision.score ?? 80 },
            { title: "Financier", icon: "💰", score: score?.financier.score ?? 55 },
            { title: "Technique", icon: "🔧", score: score?.technique.score ?? 100 },
            { title: "Protection", icon: "⚖️", score: score?.protection.score ?? 50 },
          ].map((cat) => (
            <Card key={cat.title}>
              <CardContent className="p-3 text-center">
                <span>{cat.icon}</span>
                <p className="text-xs font-medium mt-1">{cat.title}</p>
                <p className="text-lg font-bold" style={{ color: cat.score >= 80 ? "#22c55e" : cat.score >= 50 ? "#eab308" : "#ef4444" }}>
                  {cat.score}%
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Téléchargements */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Télécharger mon dossier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => handleExport("one_pager")}>
                <FileText className="w-5 h-5" />
                <span className="text-xs">One-pager</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => handleExport("pitch_deck")}>
                <Target className="w-5 h-5" />
                <span className="text-xs">Pitch deck</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => handleExport("cahier_charges")}>
                <FileText className="w-5 h-5" />
                <span className="text-xs">Cahier des charges</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-2" onClick={() => handleExport("business_plan")}>
                <Download className="w-5 h-5" />
                <span className="text-xs">Business plan</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Horodatage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4" /> Protection & Horodatage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {timestampData ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="font-semibold">Projet horodate</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <p className="text-xs text-muted-foreground">Hash SHA-256 :</p>
                  <p className="text-xs font-mono break-all">{timestampData.hash}</p>
                  <p className="text-xs text-muted-foreground mt-2">Date :</p>
                  <p className="text-xs">{new Date(timestampData.timestamp).toLocaleString("fr-FR")}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-2">
                <p className="text-sm text-muted-foreground text-center">
                  Horodater ton projet genere une empreinte SHA-256 unique, prouvant l&apos;anteriorite de ton travail.
                </p>
                <Button
                  onClick={handleTimestamp}
                  disabled={timestampLoading}
                  variant="outline"
                  className="min-w-[200px]"
                >
                  {timestampLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                  Horodater mon projet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logos */}
        {logoUrls.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Logos generes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {logoUrls.map((url, idx) => (
                  <div key={idx} className="aspect-square rounded-xl border border-border overflow-hidden bg-white flex items-center justify-center">
                    <img src={url} alt={`Logo proposition ${idx + 1}`} className="w-full h-full object-contain p-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {logoTaskIds.length > 0 && logoUrls.length === 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Logos</CardTitle>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="outline" onClick={pollLogoStatus} disabled={logoPolling}>
                {logoPolling ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                Charger les logos generes
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Prochaines étapes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Prochaines étapes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => { window.open(`https://${profile.slug}.ivoire.io`, "_blank"); }}>
                <Globe className="w-5 h-5" style={{ color: "var(--color-orange)" }} />
                <span className="text-xs">Voir ma vitrine</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => onNavigate("fundraising")}>
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-xs">Levée de fonds</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => onNavigate("team")}>
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-xs">Inviter l'équipe</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => onNavigate("jobs")}>
                <Rocket className="w-5 h-5 text-purple-500" />
                <span className="text-xs">Publier une offre</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="min-w-[250px]"
            style={{ background: "var(--color-orange)", color: "#fff" }}
            onClick={() => onNavigate("overview")}
          >
            Aller au dashboard →
          </Button>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
