"use client";

import { Button } from "@/components/ui/button";
import type { Experience, Profile, Project } from "@/lib/types";
import {
  CheckCircle,
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Star,
  Twitter,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

interface PortfolioPageProps {
  profile: Profile;
  projects: Project[];
  experiences: Experience[];
}

type FormStatus = "idle" | "loading" | "success" | "error";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    month: "short",
    year: "numeric",
  });
}

export function PortfolioPage({
  profile,
  projects,
  experiences,
}: PortfolioPageProps) {
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot — si rempli, il s'agit d'un bot
    if (data.get("website")) return;

    const name = (data.get("sender_name") as string).trim();
    const email = (data.get("sender_email") as string).trim().toLowerCase();
    const message = (data.get("message") as string).trim();

    if (name.length < 2) {
      setFormError("Votre nom doit contenir au moins 2 caractères.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setFormError("Adresse email invalide.");
      return;
    }
    if (message.length < 10) {
      setFormError("Votre message doit contenir au moins 10 caractères.");
      return;
    }
    if (message.length > 2000) {
      setFormError("Votre message ne doit pas dépasser 2000 caractères.");
      return;
    }

    setFormStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: profile.id, sender_name: name, sender_email: email, message }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Une erreur est survenue.");
      }

      setFormStatus("success");
      formRef.current?.reset();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Une erreur est survenue. Réessayez.");
      setFormStatus("error");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — sticky, minimal */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50 py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="font-mono text-sm font-semibold tracking-tight">
            {profile.slug}.ivoire.io
          </span>
          <Link
            href="https://ivoire.io"
            className="text-xs text-muted hover:text-white/60 transition-colors"
            aria-label="Powered by ivoire.io"
          >
            🇨🇮 ivoire.io
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-16">

        {/* ── Hero ── */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row items-start gap-8">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {profile.avatar_url ? (
                <div className="relative w-28 h-28 rounded-full ring-2 ring-orange/30 ring-offset-2 ring-offset-background overflow-hidden">
                  <Image
                    src={profile.avatar_url}
                    alt={`Photo de profil de ${profile.full_name}`}
                    fill
                    sizes="112px"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-full ring-2 ring-orange/30 ring-offset-2 ring-offset-background bg-orange/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl font-bold text-orange" aria-hidden="true">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {profile.is_available && (
                <span
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green border-2 border-background"
                  title="Disponible pour des missions"
                  aria-label="Disponible pour des missions"
                />
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  {profile.full_name}
                </h1>
                {profile.is_available && (
                  <span className="px-2.5 py-0.5 bg-green/10 border border-green/20 rounded-full text-green text-xs font-medium whitespace-nowrap">
                    Disponible
                  </span>
                )}
              </div>

              {profile.title && (
                <p className="text-orange font-medium text-lg mt-1.5">
                  {profile.title}
                </p>
              )}

              {profile.city && (
                <p className="text-muted text-sm mt-2 flex items-center gap-1.5">
                  <MapPin size={13} />
                  {profile.city}, Côte d&apos;Ivoire
                </p>
              )}

              {/* Social links */}
              <div className="flex items-center gap-4 mt-5">
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-white transition-colors"
                    aria-label="Profil GitHub"
                  >
                    <Github size={20} />
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-white transition-colors"
                    aria-label="Profil LinkedIn"
                  >
                    <Linkedin size={20} />
                  </a>
                )}
                {profile.twitter_url && (
                  <a
                    href={profile.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-white transition-colors"
                    aria-label="Profil Twitter / X"
                  >
                    <Twitter size={20} />
                  </a>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-white transition-colors"
                    aria-label="Site web personnel"
                  >
                    <Globe size={20} />
                  </a>
                )}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mt-6">
                <a href="#contact">
                  <Button size="md" className="gap-2">
                    <Mail size={16} />
                    Me contacter
                  </Button>
                </a>
                <a href="#contact">
                  <Button variant="secondary" size="md" className="gap-2 !border-orange/40 !text-orange hover:!bg-orange/10">
                    M&apos;embaucher
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-[#A0A0A0] leading-relaxed mt-10 max-w-2xl text-base sm:text-lg">
              {profile.bio}
            </p>
          )}
        </section>

        {/* ── Skills ── */}
        {profile.skills.length > 0 && (
          <section className="mb-16" aria-labelledby="skills-heading">
            <h2 id="skills-heading" className="text-xl font-semibold mb-5 text-white/90">
              Compétences
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-1.5 bg-surface border border-border rounded-lg text-sm font-mono text-muted hover:border-orange/50 hover:text-orange transition-all duration-200 cursor-default select-none"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── Projects ── */}
        {projects.length > 0 && (
          <section className="mb-16" aria-labelledby="projects-heading">
            <h2 id="projects-heading" className="text-xl font-semibold mb-5 text-white/90">
              Projets
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="bg-surface border border-border rounded-2xl overflow-hidden group hover:border-orange/30 hover:shadow-lg hover:shadow-orange/5 transition-all duration-300 flex flex-col"
                >
                  {/* Image or placeholder */}
                  <div className="relative w-full h-40 bg-border/20 overflow-hidden flex-shrink-0">
                    {project.image_url ? (
                      <Image
                        src={project.image_url}
                        alt={`Aperçu du projet ${project.name}`}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-border/60 font-mono select-none">
                          {project.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-semibold text-base leading-snug">{project.name}</h3>

                    {project.description && (
                      <p className="text-muted text-sm mt-2 line-clamp-2 flex-1">
                        {project.description}
                      </p>
                    )}

                    {project.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {project.tech_stack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 bg-border/40 rounded text-xs text-muted font-mono"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-3">
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted hover:text-white transition-colors text-sm flex items-center gap-1.5"
                            aria-label={`Code source de ${project.name}`}
                          >
                            <Github size={14} />
                            <span>Code</span>
                          </a>
                        )}
                        {project.demo_url && (
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange hover:text-orange/80 transition-colors text-sm flex items-center gap-1.5"
                            aria-label={`Démo en ligne de ${project.name}`}
                          >
                            <ExternalLink size={14} />
                            <span>Demo</span>
                          </a>
                        )}
                      </div>
                      {project.stars > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted" aria-label={`${project.stars} étoiles GitHub`}>
                          <Star size={12} className="fill-orange/60 text-orange/60" />
                          {project.stars}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── Experiences ── */}
        {experiences.length > 0 && (
          <section className="mb-16" aria-labelledby="exp-heading">
            <h2 id="exp-heading" className="text-xl font-semibold mb-5 text-white/90">
              Expérience
            </h2>
            <ol className="relative border-l border-border/50 ml-3 space-y-8">
              {experiences.map((exp, index) => (
                <li key={exp.id} className="pl-8 relative">
                  {/* Timeline dot */}
                  <span
                    className="absolute -left-[9px] top-1 w-[18px] h-[18px] rounded-full bg-background border-2 border-orange/50 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {index === 0 && !exp.end_date && (
                      <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                    )}
                  </span>

                  <div>
                    <h3 className="font-semibold text-base">{exp.role}</h3>
                    <p className="text-orange text-sm font-medium mt-0.5">{exp.company}</p>
                    <p className="text-muted text-xs mt-1">
                      {formatDate(exp.start_date)}
                      {" — "}
                      {exp.end_date ? formatDate(exp.end_date) : (
                        <span className="text-green">Présent</span>
                      )}
                    </p>
                    {exp.description && (
                      <p className="text-muted text-sm mt-2 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* ── Contact ── */}
        <section id="contact" className="pt-12 border-t border-border/50" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="text-xl font-semibold text-white/90">
            Travaillons ensemble
          </h2>
          <p className="text-muted mt-2 mb-8 text-sm">
            Envoyez un message directement à {profile.full_name.split(" ")[0]}.
          </p>

          {formStatus === "success" ? (
            <div className="flex items-start gap-4 p-5 bg-green/10 border border-green/20 rounded-2xl max-w-xl">
              <CheckCircle size={22} className="text-green flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Message envoyé !</p>
                <p className="text-muted text-sm mt-1">
                  {profile.full_name.split(" ")[0]} a été notifié(e) et reviendra vers vous rapidement.
                </p>
                <button
                  onClick={() => setFormStatus("idle")}
                  className="text-orange text-sm mt-3 hover:underline focus:outline-none focus-visible:underline"
                >
                  Envoyer un autre message
                </button>
              </div>
            </div>
          ) : (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              noValidate
              className="max-w-xl flex flex-col gap-5 bg-surface border border-border rounded-2xl p-6"
            >
              {/* Honeypot — champ caché pour bloquer les bots */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-name" className="text-sm font-medium text-white/80">
                  Nom <span className="text-orange" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-name"
                  name="sender_name"
                  type="text"
                  placeholder="Votre nom complet"
                  autoComplete="name"
                  maxLength={100}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-orange focus:border-orange transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-email" className="text-sm font-medium text-white/80">
                  Email <span className="text-orange" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-email"
                  name="sender_email"
                  type="email"
                  placeholder="votre@email.com"
                  autoComplete="email"
                  maxLength={200}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-orange focus:border-orange transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-message" className="text-sm font-medium text-white/80">
                  Message <span className="text-orange" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Décrivez votre projet ou votre besoin..."
                  rows={5}
                  maxLength={2000}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-orange focus:border-orange transition-colors resize-none leading-relaxed"
                />
              </div>

              {formStatus === "error" && formError && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3" role="alert">
                  <XCircle size={16} className="flex-shrink-0" />
                  {formError}
                </div>
              )}

              <Button
                type="submit"
                size="md"
                className="w-full gap-2"
                disabled={formStatus === "loading"}
              >
                {formStatus === "loading" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Envoi en cours…
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Envoyer le message
                  </>
                )}
              </Button>
            </form>
          )}
        </section>
      </main>

      {/* Footer — discret */}
      <footer className="py-8 px-4 text-center mt-8">
        <p className="text-muted/40 text-xs">
          <Link
            href="https://ivoire.io"
            className="hover:text-muted transition-colors"
          >
            ivoire.io 🇨🇮
          </Link>
        </p>
      </footer>
    </div>
  );
}
