/**
 * Tests unitaires — Fonctions utilitaires (utils.ts)
 */
import { cn, getSubdomain, isValidSlug, RESERVED_SUBDOMAINS, TABLES } from "@/lib/utils";
import { describe, expect, it } from "vitest";

// ─── isValidSlug ───

describe("isValidSlug", () => {
  it("accepte un slug valide simple", () => {
    expect(isValidSlug("ulrich")).toBe(true);
  });

  it("accepte un slug avec tirets", () => {
    expect(isValidSlug("jean-marc")).toBe(true);
  });

  it("accepte un slug de 3 caractères", () => {
    expect(isValidSlug("abc")).toBe(true);
  });

  it("accepte un slug de 30 caractères", () => {
    expect(isValidSlug("a".repeat(30))).toBe(true);
  });

  it("accepte un slug de 2 caractères", () => {
    // la regex autorise 2 chars: ^[a-z0-9]([a-z0-9-]{0,28}[a-z0-9])?$
    expect(isValidSlug("ab")).toBe(true);
  });

  it("rejette un slug de 31 caractères", () => {
    expect(isValidSlug("a".repeat(31))).toBe(false);
  });

  it("rejette un slug commençant par un tiret", () => {
    expect(isValidSlug("-ulrich")).toBe(false);
  });

  it("rejette un slug finissant par un tiret", () => {
    expect(isValidSlug("ulrich-")).toBe(false);
  });

  it("rejette un slug avec des majuscules", () => {
    expect(isValidSlug("Ulrich")).toBe(false);
  });

  it("rejette un slug avec des caractères spéciaux", () => {
    expect(isValidSlug("ulrich@io")).toBe(false);
  });

  it("rejette un slug vide", () => {
    expect(isValidSlug("")).toBe(false);
  });

  it("rejette un slug avec des espaces", () => {
    expect(isValidSlug("jean marc")).toBe(false);
  });
});

// ─── getSubdomain ───

describe("getSubdomain", () => {
  it("retourne null pour le domaine principal", () => {
    expect(getSubdomain("ivoire.io")).toBe(null);
  });

  it("retourne null pour www", () => {
    expect(getSubdomain("www.ivoire.io")).toBe(null);
  });

  it("retourne le sous-domaine pour slug.ivoire.io", () => {
    expect(getSubdomain("ulrich.ivoire.io")).toBe("ulrich");
  });

  it("retourne le sous-domaine pour devs.ivoire.io", () => {
    expect(getSubdomain("devs.ivoire.io")).toBe("devs");
  });

  it("gère lvh.me en développement local", () => {
    expect(getSubdomain("ulrich.lvh.me")).toBe("ulrich");
  });

  it("retourne null pour lvh.me sans sous-domaine", () => {
    expect(getSubdomain("lvh.me")).toBe(null);
  });

  it("gère .localhost en développement", () => {
    expect(getSubdomain("ulrich.localhost")).toBe("ulrich");
  });

  it("supprime le port", () => {
    expect(getSubdomain("ulrich.localhost:3000")).toBe("ulrich");
  });

  it("retourne null pour un seul mot (localhost)", () => {
    expect(getSubdomain("localhost")).toBe(null);
  });
});

// ─── RESERVED_SUBDOMAINS ───

describe("RESERVED_SUBDOMAINS", () => {
  it("contient les sous-domaines système", () => {
    expect(RESERVED_SUBDOMAINS.has("admin")).toBe(true);
    expect(RESERVED_SUBDOMAINS.has("api")).toBe(true);
    expect(RESERVED_SUBDOMAINS.has("devs")).toBe(true);
    expect(RESERVED_SUBDOMAINS.has("startups")).toBe(true);
    expect(RESERVED_SUBDOMAINS.has("dashboard")).toBe(true);
  });

  it("ne contient pas un slug utilisateur", () => {
    expect(RESERVED_SUBDOMAINS.has("ulrich")).toBe(false);
  });
});

// ─── TABLES ───

describe("TABLES", () => {
  it("toutes les tables ont le préfixe ivoireio_", () => {
    Object.values(TABLES).forEach((table) => {
      expect(table).toMatch(/^ivoireio_/);
    });
  });

  it("contient les tables startups", () => {
    expect(TABLES.startups).toBe("ivoireio_startups");
    expect(TABLES.startup_upvotes).toBe("ivoireio_startup_upvotes");
  });
});

// ─── cn ───

describe("cn", () => {
  it("fusionne des classes", () => {
    expect(cn("text-white", "bg-black")).toBe("text-white bg-black");
  });

  it("résout les conflits Tailwind", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("gère les valeurs conditionnelles", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });
});
