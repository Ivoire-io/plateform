import { Button } from "@/components/ui/button";
import type { Experience, Profile, Project } from "@/lib/types";
import {
  Calendar,
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Twitter,
} from "lucide-react";
import Link from "next/link";

interface PortfolioPageProps {
  profile: Profile;
  projects: Project[];
  experiences: Experience[];
}

export function PortfolioPage({
  profile,
  projects,
  experiences,
}: PortfolioPageProps) {
  return (
    <div className="min-h-screen">
      {/* Header bar */}
      <header className="border-b border-border py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="https://ivoire.io" className="flex items-center gap-1">
            <span className="text-sm font-bold text-white">ivoire</span>
            <span className="text-sm font-bold text-orange">.io</span>
          </Link>
          <span className="font-mono text-xs text-muted">
            {profile.slug}.ivoire.io
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Profile header */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-24 h-24 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-orange/20 flex items-center justify-center flex-shrink-0">
                <span className="text-4xl">
                  {profile.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold">{profile.full_name}</h1>
              {profile.title && (
                <p className="text-orange font-medium text-lg mt-1">
                  {profile.title}
                </p>
              )}
              {profile.city && (
                <p className="text-muted text-sm mt-2 flex items-center gap-1.5">
                  <MapPin size={14} />
                  {profile.city}, Côte d&apos;Ivoire
                </p>
              )}

              {/* Skills */}
              {profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-surface border border-border rounded-lg text-sm text-muted font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Social links */}
              <div className="flex items-center gap-3 mt-4">
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-white transition-colors"
                    aria-label="GitHub"
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
                    aria-label="LinkedIn"
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
                    aria-label="Twitter"
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
                    aria-label="Site web"
                  >
                    <Globe size={20} />
                  </a>
                )}
              </div>
            </div>

            {/* Availability badge */}
            {profile.is_available && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green/10 border border-green/20 rounded-full text-green text-sm whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                Disponible
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-muted leading-relaxed mt-6 max-w-2xl">
              {profile.bio}
            </p>
          )}
        </section>

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Projets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-surface border border-border rounded-2xl overflow-hidden group hover:border-orange/30 transition-colors"
                >
                  {project.image_url && (
                    <img
                      src={project.image_url}
                      alt={project.name}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    {project.description && (
                      <p className="text-muted text-sm mt-2 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    {project.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {project.tech_stack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 bg-border/50 rounded text-xs text-muted font-mono"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-4">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted hover:text-white transition-colors text-sm flex items-center gap-1"
                        >
                          <Github size={14} /> Code
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange hover:text-orange-hover transition-colors text-sm flex items-center gap-1"
                        >
                          <ExternalLink size={14} /> Demo
                        </a>
                      )}
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
            <h2 className="text-2xl font-bold mb-6">Expériences</h2>
            <div className="space-y-6">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="flex gap-4 relative"
                >
                  <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center flex-shrink-0">
                    <Calendar size={16} className="text-muted" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{exp.role}</h3>
                    <p className="text-orange text-sm">{exp.company}</p>
                    <p className="text-muted text-xs mt-1">
                      {new Date(exp.start_date).toLocaleDateString("fr-FR", {
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      —{" "}
                      {exp.end_date
                        ? new Date(exp.end_date).toLocaleDateString("fr-FR", {
                          month: "short",
                          year: "numeric",
                        })
                        : "Présent"}
                    </p>
                    {exp.description && (
                      <p className="text-muted text-sm mt-2">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact CTA */}
        <section className="text-center py-12 border-t border-border">
          <h2 className="text-2xl font-bold mb-3">Travaillons ensemble</h2>
          <p className="text-muted mb-6">
            Envie de collaborer ? Contactez {profile.full_name}.
          </p>
          <a href={`mailto:${profile.email}`}>
            <Button>
              <Mail size={18} className="mr-2" />
              Me contacter
            </Button>
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 text-center">
        <p className="text-muted text-sm">
          Propulsé par{" "}
          <Link href="https://ivoire.io" className="text-orange hover:underline">
            ivoire.io
          </Link>{" "}
          — Le hub de la tech ivoirienne 🇨🇮
        </p>
      </footer>
    </div>
  );
}
