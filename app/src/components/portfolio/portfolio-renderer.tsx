"use client";

import type { Experience, Profile, Project } from "@/lib/types";
import { ClassicLightTemplate, MinimalDarkTemplate, TerminalTemplate } from "./templates";

interface PortfolioRendererProps {
  profile: Profile;
  projects: Project[];
  experiences: Experience[];
}

const TEMPLATE_MAP: Record<string, React.ComponentType<PortfolioRendererProps>> = {
  "minimal-dark": MinimalDarkTemplate,
  "classic-light": ClassicLightTemplate,
  "terminal": TerminalTemplate,
};

export function PortfolioRenderer({ profile, projects, experiences }: PortfolioRendererProps) {
  const templateId = profile.template_id || "minimal-dark";
  const Template = TEMPLATE_MAP[templateId] ?? MinimalDarkTemplate;

  return <Template profile={profile} projects={projects} experiences={experiences} />;
}
