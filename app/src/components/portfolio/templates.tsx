"use client";

import type { Experience, Profile, Project } from "@/lib/types";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  Loader2,
  MapPin,
  Star,
  Twitter,
  XCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ReviewsSection } from "./reviews-section";

interface TemplateProps {
  profile: Profile;
  projects: Project[];
  experiences: Experience[];
  fromDevs?: boolean;
  devsUrl?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    month: "short",
    year: "numeric",
  });
}

// ─── Composant contact réutilisé ───

type FormStatus = "idle" | "loading" | "success" | "error";

function ContactForm({ profile }: { profile: Profile }) {
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("website")) return;

    const name = (data.get("sender_name") as string).trim();
    const email = (data.get("sender_email") as string).trim().toLowerCase();
    const message = (data.get("message") as string).trim();

    if (name.length < 2) { setFormError("Votre nom doit contenir au moins 2 caractères."); return; }
    if (!EMAIL_REGEX.test(email)) { setFormError("Adresse email invalide."); return; }
    if (message.length < 10) { setFormError("Votre message doit contenir au moins 10 caractères."); return; }
    if (message.length > 2000) { setFormError("2000 caractères maximum."); return; }

    setFormStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: profile.id, sender_name: name, sender_email: email, message }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Erreur.");
      setFormStatus("success");
      formRef.current?.reset();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur. Réessayez.");
      setFormStatus("error");
    }
  }

  if (formStatus === "success") {
    return (
      <div className="flex flex-col items-center text-center gap-3 p-8">
        <CheckCircle size={28} className="text-green-400" />
        <p className="font-medium">Message envoyé !</p>
        <p className="text-sm opacity-60">
          {profile.full_name.split(" ")[0]} vous répondra bientôt.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot */}
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="sender_name" required placeholder="Votre nom" className="template-input" />
        <input name="sender_email" type="email" required placeholder="Email" className="template-input" />
      </div>
      <textarea name="message" required placeholder="Votre message..." rows={4} maxLength={2000} className="template-input resize-none" />

      {formError && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <XCircle size={14} /> {formError}
        </p>
      )}

      <button type="submit" disabled={formStatus === "loading"} className="template-btn w-full">
        {formStatus === "loading" ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Envoyer"}
      </button>
    </form>
  );
}

// ─── Composants partagés ───

function SocialLinks({ profile, className = "" }: { profile: Profile; className?: string }) {
  const links = [
    { url: profile.github_url, icon: Github, label: "GitHub" },
    { url: profile.linkedin_url, icon: Linkedin, label: "LinkedIn" },
    { url: profile.twitter_url, icon: Twitter, label: "Twitter" },
    { url: profile.website_url, icon: Globe, label: "Site web" },
  ].filter((l) => l.url);

  if (!links.length) return null;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {links.map(({ url, icon: Icon, label }) => (
        <a key={label} href={url!} target="_blank" rel="noopener noreferrer" className="social-link" aria-label={label}>
          <Icon size={20} />
        </a>
      ))}
    </div>
  );
}

function BackLink({ fromDevs, devsUrl }: { fromDevs: boolean; devsUrl: string }) {
  if (!fromDevs) return null;
  return (
    <Link href={devsUrl} className="flex items-center gap-1.5 text-xs opacity-60 hover:opacity-100 transition-opacity">
      <ArrowLeft size={14} /> Retour à l&apos;annuaire
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 1 : Minimal Dark (default)
// ═══════════════════════════════════════════════════════════════════════════

export function MinimalDarkTemplate({ profile, projects, experiences, fromDevs, devsUrl }: TemplateProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <style>{`
        .template-input { @apply w-full px-4 py-3 bg-[#161b22] border border-[#1a1a2e] rounded-lg text-white placeholder:text-[#606060] focus:border-[#FF6B00] focus:outline-none transition-colors; }
        .template-btn { @apply px-6 py-3 bg-[#FF6B00] hover:bg-[#E65F00] text-white font-medium rounded-lg transition-colors disabled:opacity-50; }
        .social-link { @apply text-[#A0A0A0] hover:text-white transition-colors; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0A0A0A]/80 border-b border-[#1a1a2e]/50 py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {fromDevs ? (
            <BackLink fromDevs={fromDevs} devsUrl={devsUrl || "https://devs.ivoire.io"} />
          ) : (
            <span className="font-mono text-sm font-semibold tracking-tight">{profile.slug}.ivoire.io</span>
          )}
          <Link href="https://ivoire.io" className="text-xs text-[#A0A0A0] hover:text-white/60 transition-colors">🇨🇮 ivoire.io</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero */}
        <section className="mb-16 flex flex-col sm:flex-row items-start gap-8">
          <div className="relative flex-shrink-0">
            {profile.avatar_url ? (
              <div className="relative w-28 h-28 rounded-full ring-2 ring-[#FF6B00]/30 ring-offset-2 ring-offset-[#0A0A0A] overflow-hidden">
                <Image src={profile.avatar_url} alt={profile.full_name} fill sizes="112px" className="object-cover" priority />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full ring-2 ring-[#FF6B00]/30 ring-offset-2 ring-offset-[#0A0A0A] bg-[#FF6B00]/10 flex items-center justify-center">
                <span className="text-4xl font-bold text-[#FF6B00]">{profile.full_name.charAt(0)}</span>
              </div>
            )}
            {profile.is_available && <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0A0A0A]" title="Disponible" />}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{profile.full_name}</h1>
            {profile.title && <p className="text-[#FF6B00] font-medium text-lg mt-1.5">{profile.title}</p>}
            {profile.city && <p className="text-[#A0A0A0] text-sm mt-2 flex items-center gap-1.5"><MapPin size={13} />{profile.city}, Côte d&apos;Ivoire</p>}
            <SocialLinks profile={profile} className="mt-5" />
            {profile.bio && <p className="text-[#A0A0A0] leading-relaxed mt-6 max-w-2xl">{profile.bio}</p>}
          </div>
        </section>

        {/* Skills */}
        {profile.skills.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xl font-semibold mb-5">Compétences</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span key={s} className="px-4 py-1.5 bg-[#0D1117] border border-[#1a1a2e] rounded-lg text-sm font-mono text-[#A0A0A0] hover:border-[#FF6B00]/50 hover:text-[#FF6B00] transition-all">{s}</span>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xl font-semibold mb-5">Projets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((p) => (
                <article key={p.id} className="bg-[#0D1117] border border-[#1a1a2e] rounded-2xl overflow-hidden group hover:border-[#FF6B00]/30 transition-all flex flex-col">
                  <div className="relative w-full h-40 bg-[#1a1a2e]/20 overflow-hidden">
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.name} fill sizes="(max-width:640px)100vw,50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><span className="text-4xl font-bold text-[#1a1a2e] font-mono">{p.name.charAt(0)}</span></div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-semibold">{p.name}</h3>
                    {p.description && <p className="text-[#A0A0A0] text-sm mt-2 line-clamp-2 flex-1">{p.description}</p>}
                    {p.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {p.tech_stack.map((t) => <span key={t} className="px-2 py-0.5 bg-[#1a1a2e]/40 rounded text-xs text-[#A0A0A0] font-mono">{t}</span>)}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#1a1a2e]/50">
                      {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="text-[#A0A0A0] hover:text-white text-sm flex items-center gap-1.5"><Github size={14} />Code</a>}
                      {p.demo_url && <a href={p.demo_url} target="_blank" rel="noopener noreferrer" className="text-[#FF6B00] hover:text-[#FF6B00]/80 text-sm flex items-center gap-1.5"><ExternalLink size={14} />Demo</a>}
                      {p.stars > 0 && <span className="ml-auto flex items-center gap-1 text-xs text-[#A0A0A0]"><Star size={12} className="fill-[#FF6B00]/60 text-[#FF6B00]/60" />{p.stars}</span>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Experiences */}
        {experiences.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xl font-semibold mb-5">Expérience</h2>
            <ol className="relative border-l border-[#1a1a2e]/50 ml-3 space-y-8">
              {experiences.map((exp, i) => (
                <li key={exp.id} className="pl-8 relative">
                  <span className="absolute -left-[9px] top-1 w-[18px] h-[18px] rounded-full bg-[#0A0A0A] border-2 border-[#FF6B00]/50 flex items-center justify-center">
                    {i === 0 && !exp.end_date && <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />}
                  </span>
                  <h3 className="font-semibold">{exp.role}</h3>
                  <p className="text-[#FF6B00] text-sm font-medium mt-0.5">{exp.company}</p>
                  <p className="text-[#A0A0A0] text-xs mt-1">{formatDate(exp.start_date)} — {exp.end_date ? formatDate(exp.end_date) : <span className="text-green-400">Présent</span>}</p>
                  {exp.description && <p className="text-[#A0A0A0] text-sm mt-2 leading-relaxed">{exp.description}</p>}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Reviews */}
        <section className="mb-16">
          <ReviewsSection slug={profile.slug} />
        </section>

        {/* Contact */}
        <section id="contact" className="pt-16 border-t border-[#1a1a2e]/50">
          <h2 className="text-2xl font-bold mb-6">Travaillons <span className="text-[#FF6B00]">ensemble.</span></h2>
          <div className="flex flex-col gap-4">
            <Link
              href={`/booking/${profile.slug}`}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#FF6B00]/10 border border-[#FF6B00]/30 hover:bg-[#FF6B00]/20 text-[#FF6B00] font-medium rounded-lg transition-colors"
            >
              <Calendar size={18} />
              Prendre un rendez-vous
            </Link>
            <ContactForm profile={profile} />
          </div>
        </section>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 2 : Classic Light
// ═══════════════════════════════════════════════════════════════════════════

export function ClassicLightTemplate({ profile, projects, experiences, fromDevs, devsUrl }: TemplateProps) {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a]">
      <style>{`
        .template-input { @apply w-full px-4 py-3 bg-white border border-[#e5e5e5] rounded-lg text-[#1a1a1a] placeholder:text-[#999] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] focus:outline-none transition-colors; }
        .template-btn { @apply px-6 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium rounded-lg transition-colors disabled:opacity-50; }
        .social-link { @apply text-[#666] hover:text-[#2563eb] transition-colors; }
      `}</style>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e5e5e5] py-3 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {fromDevs ? (
            <BackLink fromDevs={fromDevs} devsUrl={devsUrl || "https://devs.ivoire.io"} />
          ) : (
            <span className="font-mono text-sm font-semibold text-[#2563eb]">{profile.slug}.ivoire.io</span>
          )}
          <Link href="https://ivoire.io" className="text-xs text-[#999] hover:text-[#666]">🇨🇮 ivoire.io</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16">
        {/* Hero centered */}
        <section className="text-center mb-16">
          {profile.avatar_url ? (
            <div className="relative w-32 h-32 rounded-full mx-auto ring-4 ring-[#2563eb]/20 overflow-hidden mb-6">
              <Image src={profile.avatar_url} alt={profile.full_name} fill sizes="128px" className="object-cover" priority />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full mx-auto ring-4 ring-[#2563eb]/20 bg-[#2563eb]/10 flex items-center justify-center mb-6">
              <span className="text-5xl font-bold text-[#2563eb]">{profile.full_name.charAt(0)}</span>
            </div>
          )}
          <h1 className="text-3xl font-bold">{profile.full_name}</h1>
          {profile.title && <p className="text-[#2563eb] font-medium text-lg mt-1">{profile.title}</p>}
          {profile.city && <p className="text-[#666] text-sm mt-2 flex items-center justify-center gap-1"><MapPin size={13} />{profile.city}, Côte d&apos;Ivoire</p>}
          {profile.is_available && <span className="inline-block mt-3 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-medium">Disponible</span>}
          <SocialLinks profile={profile} className="mt-5 justify-center" />
          {profile.bio && <p className="text-[#555] leading-relaxed mt-6 max-w-xl mx-auto">{profile.bio}</p>}
        </section>

        {/* Skills */}
        {profile.skills.length > 0 && (
          <section className="mb-14">
            <h2 className="text-lg font-semibold mb-4 text-[#2563eb]">Compétences</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span key={s} className="px-3 py-1.5 bg-white border border-[#e5e5e5] rounded-full text-sm text-[#555] hover:border-[#2563eb] hover:text-[#2563eb] transition-all">{s}</span>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-14">
            <h2 className="text-lg font-semibold mb-4 text-[#2563eb]">Projets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {projects.map((p) => (
                <article key={p.id} className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  <div className="relative w-full h-36 bg-[#f0f0f0] overflow-hidden">
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.name} fill sizes="(max-width:640px)100vw,50vw" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#ddd]">{p.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-sm">{p.name}</h3>
                    {p.description && <p className="text-[#777] text-sm mt-1 line-clamp-2 flex-1">{p.description}</p>}
                    {p.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.tech_stack.map((t) => <span key={t} className="px-2 py-0.5 bg-[#f5f5f5] rounded text-xs text-[#888]">{t}</span>)}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-3 pt-2 border-t border-[#f0f0f0]">
                      {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="text-[#888] hover:text-[#1a1a1a] text-xs flex items-center gap-1"><Github size={13} />Code</a>}
                      {p.demo_url && <a href={p.demo_url} target="_blank" rel="noopener noreferrer" className="text-[#2563eb] text-xs flex items-center gap-1"><ExternalLink size={13} />Demo</a>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Experiences */}
        {experiences.length > 0 && (
          <section className="mb-14">
            <h2 className="text-lg font-semibold mb-4 text-[#2563eb]">Expérience</h2>
            <div className="space-y-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="bg-white border border-[#e5e5e5] rounded-xl p-5">
                  <h3 className="font-semibold">{exp.role}</h3>
                  <p className="text-[#2563eb] text-sm">{exp.company}</p>
                  <p className="text-[#999] text-xs mt-1">{formatDate(exp.start_date)} — {exp.end_date ? formatDate(exp.end_date) : <span className="text-green-600">Présent</span>}</p>
                  {exp.description && <p className="text-[#666] text-sm mt-2">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="mb-14">
          <ReviewsSection slug={profile.slug} />
        </section>

        {/* Contact */}
        <section id="contact" className="pt-12 border-t border-[#e5e5e5]">
          <h2 className="text-xl font-bold mb-6">Me contacter</h2>
          <div className="bg-white border border-[#e5e5e5] rounded-xl p-6">
            <Link
              href={`/booking/${profile.slug}`}
              className="flex items-center justify-center gap-2 mb-4 px-6 py-3 bg-[#2563eb]/10 border border-[#2563eb]/30 hover:bg-[#2563eb]/20 text-[#2563eb] font-medium rounded-lg transition-colors"
            >
              <Calendar size={18} />
              Prendre un rendez-vous
            </Link>
            <ContactForm profile={profile} />
          </div>
        </section>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE 3 : Terminal
// ═══════════════════════════════════════════════════════════════════════════

export function TerminalTemplate({ profile, projects, experiences, fromDevs, devsUrl }: TemplateProps) {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-mono">
      <style>{`
        .template-input { @apply w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded text-[#c9d1d9] font-mono placeholder:text-[#484f58] focus:border-[#39d353] focus:outline-none transition-colors; }
        .template-btn { @apply px-6 py-3 bg-[#238636] hover:bg-[#2ea043] text-white font-mono font-medium rounded transition-colors disabled:opacity-50; }
        .social-link { @apply text-[#484f58] hover:text-[#39d353] transition-colors; }
      `}</style>

      {/* Terminal header */}
      <header className="sticky top-0 z-50 bg-[#161b22] border-b border-[#30363d] py-2.5 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          {fromDevs ? (
            <BackLink fromDevs={fromDevs} devsUrl={devsUrl || "https://devs.ivoire.io"} />
          ) : (
            <span className="text-xs text-[#484f58]">~/{profile.slug}.ivoire.io</span>
          )}
          <Link href="https://ivoire.io" className="ml-auto text-xs text-[#484f58] hover:text-[#39d353]">ivoire.io</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Identity */}
        <section className="mb-12">
          <div className="flex items-start gap-6">
            {profile.avatar_url ? (
              <div className="relative w-20 h-20 rounded border-2 border-[#39d353]/40 overflow-hidden flex-shrink-0">
                <Image src={profile.avatar_url} alt={profile.full_name} fill sizes="80px" className="object-cover" priority />
              </div>
            ) : (
              <div className="w-20 h-20 rounded border-2 border-[#39d353]/40 bg-[#39d353]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-[#39d353]">{profile.full_name.charAt(0)}</span>
              </div>
            )}
            <div>
              <p className="text-[#39d353]">$ whoami</p>
              <h1 className="text-2xl font-bold text-white mt-1">{profile.full_name}</h1>
              {profile.title && <p className="text-[#f0883e] mt-1"># {profile.title}</p>}
              {profile.city && <p className="text-[#484f58] text-sm mt-1">📍 {profile.city}, CI</p>}
              {profile.is_available && <p className="text-[#39d353] text-sm mt-2">● Status: <span className="text-[#39d353]">available</span></p>}
            </div>
          </div>
          {profile.bio && (
            <div className="mt-6 pl-4 border-l-2 border-[#30363d]">
              <p className="text-[#8b949e] text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}
          <SocialLinks profile={profile} className="mt-4" />
        </section>

        {/* Skills */}
        {profile.skills.length > 0 && (
          <section className="mb-12">
            <p className="text-[#39d353] text-sm mb-3">$ cat skills.json</p>
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
              <p className="text-[#484f58]">{"["}</p>
              {profile.skills.map((s, i) => (
                <p key={s} className="pl-4 text-sm">
                  <span className="text-[#a5d6ff]">&quot;{s}&quot;</span>
                  {i < profile.skills.length - 1 && <span className="text-[#484f58]">,</span>}
                </p>
              ))}
              <p className="text-[#484f58]">{"]"}</p>
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-12">
            <p className="text-[#39d353] text-sm mb-3">$ ls ./projects/</p>
            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#39d353]/40 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-bold text-sm">{p.name}</h3>
                      {p.description && <p className="text-[#8b949e] text-sm mt-1 line-clamp-2">{p.description}</p>}
                      {p.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {p.tech_stack.map((t) => <span key={t} className="px-2 py-0.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#58a6ff]">{t}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="text-[#484f58] hover:text-[#c9d1d9]"><Github size={16} /></a>}
                      {p.demo_url && <a href={p.demo_url} target="_blank" rel="noopener noreferrer" className="text-[#484f58] hover:text-[#39d353]"><ExternalLink size={16} /></a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experiences */}
        {experiences.length > 0 && (
          <section className="mb-12">
            <p className="text-[#39d353] text-sm mb-3">$ git log --career</p>
            <div className="space-y-2">
              {experiences.map((exp) => (
                <div key={exp.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <p className="text-sm">
                    <span className="text-[#f0883e]">{formatDate(exp.start_date)}</span>
                    <span className="text-[#484f58]"> → </span>
                    <span className="text-[#f0883e]">{exp.end_date ? formatDate(exp.end_date) : "now"}</span>
                  </p>
                  <p className="text-white font-bold mt-1">{exp.role}</p>
                  <p className="text-[#58a6ff] text-sm">@ {exp.company}</p>
                  {exp.description && <p className="text-[#8b949e] text-sm mt-2">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="mb-12">
          <ReviewsSection slug={profile.slug} />
        </section>

        {/* Contact */}
        <section id="contact" className="pt-12 border-t border-[#30363d]">
          <p className="text-[#39d353] text-sm mb-4">$ mail {profile.full_name.split(" ")[0].toLowerCase()}</p>
          <Link
            href={`/booking/${profile.slug}`}
            className="flex items-center justify-center gap-2 mb-4 px-6 py-3 bg-[#238636]/20 border border-[#238636]/40 hover:bg-[#238636]/30 text-[#39d353] font-mono font-medium rounded transition-colors"
          >
            <Calendar size={18} />
            book --appointment
          </Link>
          <ContactForm profile={profile} />
        </section>
      </main>
    </div>
  );
}
