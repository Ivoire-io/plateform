import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import PlausibleProvider from "next-plausible";
import { ThemeProvider } from "next-themes";
import { Geist, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const siteUrl = "https://ivoire.io";
const siteTitle = "ivoire.io — L'OS Digital de la Côte d'Ivoire";
const siteDescription =
  "Le hub central des développeurs, startups et services tech de Côte d'Ivoire. Réclame ton portfolio gratuit sur nom.ivoire.io.";

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: "%s | ivoire.io",
  },
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  keywords: [
    "développeurs Côte d'Ivoire",
    "portfolio développeur ivoirien",
    "tech Abidjan",
    "startups Côte d'Ivoire",
    "ivoire.io",
    "freelance Abidjan",
    "annuaire développeurs CI",
  ],
  authors: [{ name: "ivoire.io", url: siteUrl }],
  creator: "ivoire.io",
  publisher: "ivoire.io",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: "ivoire.io",
    locale: "fr_CI",
    type: "website",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "ivoire.io — L'OS Digital de la Côte d'Ivoire",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.webp"],
    site: "@ivoire_io",
    creator: "@ivoire_io",
  },
  icons: {
    icon: [
      { url: "/favicon.jpg", type: "image/jpeg" },
      { url: "/favicon.webp", type: "image/webp" },
    ],
    shortcut: "/favicon.jpg",
    apple: "/favicon.jpg",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ivoire.io",
    url: "https://ivoire.io",
    description: "Le hub central des développeurs, startups et services tech de Côte d'Ivoire.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://devs.ivoire.io?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
    inLanguage: "fr-CI",
    publisher: {
      "@type": "Organization",
      name: "ivoire.io",
      url: "https://ivoire.io",
      logo: {
        "@type": "ImageObject",
        url: "https://ivoire.io/logo-ivoire.io-blanc.webp",
      },
    },
  };

  return (
    <html lang="fr" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <PlausibleProvider domain="ivoire.io">
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </PlausibleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
