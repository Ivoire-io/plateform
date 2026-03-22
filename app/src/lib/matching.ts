// ─── Matching Algorithm ───
// Computes a match score between a developer profile and an entity (job/request)

import type { DevRequest, JobListing, Profile } from "./types";

interface MatchResult {
  score: number;
  reasons: string[];
}

/**
 * Compute match score between a developer and a job listing
 */
export function matchDevToJob(dev: Profile, job: JobListing): MatchResult {
  const reasons: string[] = [];
  let score = 0;

  // Skills overlap (40 points max)
  const requiredSkills = [...job.tech_tags, ...job.requirements].map((s) => s.toLowerCase());
  const devSkills = dev.skills.map((s) => s.toLowerCase());
  if (requiredSkills.length > 0) {
    const overlap = devSkills.filter((s) => requiredSkills.some((r) => r.includes(s) || s.includes(r)));
    const skillScore = Math.min(40, Math.round((overlap.length / requiredSkills.length) * 40));
    score += skillScore;
    if (overlap.length > 0) {
      reasons.push(`${overlap.length} competence(s) en commun`);
    }
  }

  // City match (20 points)
  if (dev.city && job.location) {
    if (dev.city.toLowerCase() === job.location.toLowerCase()) {
      score += 20;
      reasons.push("Meme ville");
    } else {
      score += 5;
    }
  }
  if (job.remote_ok) {
    score += 10;
    reasons.push("Remote OK");
  }

  // Availability (20 points)
  if (dev.is_available) {
    score += 20;
    reasons.push("Disponible");
  }

  // Verified badge bonus (10 points)
  if (dev.verified_badge) {
    score += 10;
    reasons.push("Profil verifie");
  }

  return { score: Math.min(100, score), reasons };
}

/**
 * Compute match score between a developer and a dev outsourcing request
 */
export function matchDevToRequest(dev: Profile, request: DevRequest): MatchResult {
  const reasons: string[] = [];
  let score = 0;

  // Role match (40 points)
  const requiredRoles = request.required_roles.map((r) => r.toLowerCase());
  const devSkills = dev.skills.map((s) => s.toLowerCase());
  const devTitle = (dev.title || "").toLowerCase();

  const roleMatch = requiredRoles.some((role) =>
    devSkills.some((s) => s.includes(role) || role.includes(s)) ||
    devTitle.includes(role)
  );
  if (roleMatch) {
    score += 40;
    reasons.push("Competences correspondantes");
  }

  // Availability (20 points)
  if (dev.is_available) {
    score += 20;
    reasons.push("Disponible");
  }

  // Verified (10 points)
  if (dev.verified_badge) {
    score += 10;
    reasons.push("Profil verifie");
  }

  // Plan level bonus (10 points for pro+)
  if (dev.plan === "pro" || dev.plan === "growth") {
    score += 10;
    reasons.push("Membre Pro");
  }

  // City (10 points)
  if (dev.city) {
    score += 10;
  }

  return { score: Math.min(100, score), reasons };
}
