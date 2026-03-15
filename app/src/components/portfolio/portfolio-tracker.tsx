"use client";

import { useEffect } from "react";

interface PortfolioTrackerProps {
  profileId: string;
}

/**
 * Composant client invisible — enregistre une vue de portfolio au montage.
 * Utilise sendBeacon pour ne pas bloquer le rendu.
 */
export function PortfolioTracker({ profileId }: PortfolioTrackerProps) {
  useEffect(() => {
    const payload = JSON.stringify({
      profile_id: profileId,
      referrer: document.referrer || null,
      user_agent_hint: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop",
    });

    // sendBeacon si disponible (non bloquant), sinon fetch silencieux
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/portfolio/track", blob);
    } else {
      fetch("/api/portfolio/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => { });
    }
  }, [profileId]);

  return null;
}
