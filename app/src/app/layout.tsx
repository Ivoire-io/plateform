import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ivoire.io — L'OS Digital de la Côte d'Ivoire",
  description:
    "Le hub central des développeurs, startups et services tech de Côte d'Ivoire. Réclame ton portfolio sur nom.ivoire.io — gratuit.",
  metadataBase: new URL("https://ivoire.io"),
  openGraph: {
    title: "ivoire.io — L'OS Digital de la Côte d'Ivoire",
    description:
      "Le hub central des développeurs, startups et services tech de Côte d'Ivoire.",
    url: "https://ivoire.io",
    siteName: "ivoire.io",
    locale: "fr_CI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ivoire.io",
    description:
      "Le hub central des développeurs, startups et services tech de Côte d'Ivoire.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
