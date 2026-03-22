"use client";

import type { Experience, Profile, Project } from "@/lib/types";
import { useEffect, useState } from "react";
import { ClassicLightTemplate, MinimalDarkTemplate, TerminalTemplate } from "./templates";

interface PortfolioRendererProps {
  profile: Profile;
  projects: Project[];
  experiences: Experience[];
}

interface TemplateComponentProps extends PortfolioRendererProps {
  fromDevs?: boolean;
  devsUrl?: string;
}

const TEMPLATE_MAP: Record<string, React.ComponentType<TemplateComponentProps>> = {
  "minimal-dark": MinimalDarkTemplate,
  "classic-light": ClassicLightTemplate,
  "terminal": TerminalTemplate,
};

export function PortfolioRenderer({ profile, projects, experiences }: PortfolioRendererProps) {
  const [fromDevs, setFromDevs] = useState(false);
  const [devsUrl, setDevsUrl] = useState("https://devs.ivoire.io");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("from") === "devs") {
      setFromDevs(true);
      const h = window.location.hostname;
      if (h.endsWith(".localhost") || h === "localhost") {
        setDevsUrl(`http://devs.localhost:${window.location.port || "3000"}`);
      }
    }
  }, []);

  const templateId = profile.template_id || "minimal-dark";
  const Template = TEMPLATE_MAP[templateId] ?? MinimalDarkTemplate;

  return <Template profile={profile} projects={projects} experiences={experiences} fromDevs={fromDevs} devsUrl={devsUrl} />;
}
