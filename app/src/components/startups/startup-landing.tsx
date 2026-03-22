"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  FolderUp,
  Globe,
  Heart,
  Lightbulb,
  PenLine,
  Rocket,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export function StartupLanding() {
  return (
    <div className="pt-16">
      {/* ────────────── HERO ────────────── */}
      <section className="min-h-[85vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Glowing Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-orange/10 rounded-full blur-[140px] -z-10 opacity-50 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-orange)_0%,_transparent_60%)] opacity-[0.05] -z-10 pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center mt-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer as any}
        >
          <motion.div variants={fadeUp as any} className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange/20 bg-orange/5 text-orange text-sm font-medium">
            <Rocket size={14} />
            Pour les Startups & Fondateurs 🇨🇮
          </motion.div>

          <motion.h1 variants={fadeUp as any} className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-8">
            Tu as une idée ?
            <br />
            <span className="text-orange">On en fait une startup.</span>
          </motion.h1>

          <motion.p variants={fadeUp as any} className="text-muted/80 text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            Un dossier complet, une page en ligne, une communauté. Tout pour passer de l'idée au <strong className="text-white font-semibold">lancement</strong>.
          </motion.p>

          <motion.div variants={fadeUp as any} className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link href="/rejoindre/startup">
              <Button size="lg" className="h-14 px-8 text-base font-semibold gap-2 shadow-[0_0_30px_rgba(255,165,0,0.3)] hover:shadow-[0_0_40px_rgba(255,165,0,0.4)] transition-all">
                <Rocket size={20} />
                Lancer mon projet
              </Button>
            </Link>
            <Link href="/startups">
              <Button variant="outline" size="lg" className="h-14 px-8 text-base font-medium hover:bg-surface border-white/10">
                Explorer les startups
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ────────────── PROJECT BUILDER ────────────── */}
      <section className="py-32 px-4 bg-surface/20 border-y border-white/5 relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange/20 bg-orange/5 text-orange text-sm mb-6 font-semibold tracking-wide uppercase"
            >
              <Sparkles size={14} />
              AI Project Builder
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
            >
              Dis-nous où tu en es.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted/80 text-xl max-w-2xl mx-auto leading-relaxed"
            >
              Le résultat est le même : un projet structuré, présentable aux investisseurs, et partagé publiquement.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Mode A */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <Link href="/rejoindre/startup" className="block h-full">
                <div className="bg-surface/50 backdrop-blur-sm border border-white/5 rounded-3xl p-10 hover:border-green-400/30 hover:bg-surface transition-all h-full group flex flex-col">
                  <div className="w-16 h-16 rounded-2xl bg-green-400/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <FolderUp size={28} className="text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white/90">J&apos;ai déjà tout</h3>
                  <p className="text-base text-muted/70 leading-relaxed mt-auto">
                    Importe tes fichiers, pitch decks, et cahiers des charges. On audite et on met ta page en ligne.
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Mode B */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <Link href="/rejoindre/startup" className="block h-full">
                <div className="bg-surface/50 backdrop-blur-sm border border-white/5 rounded-3xl p-10 hover:border-orange/30 hover:bg-surface transition-all h-full group flex flex-col">
                  <div className="w-16 h-16 rounded-2xl bg-orange/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <PenLine size={28} className="text-orange" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white/90">J&apos;ai des éléments</h3>
                  <p className="text-base text-muted/70 leading-relaxed mt-auto">
                    Un nom, des notes, un prototype ? On construit ensemble le reste du dossier pour te lancer proprement.
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Mode C */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <Link href="/rejoindre/startup" className="block h-full">
                <div className="bg-surface backdrop-blur-sm border border-orange/30 rounded-3xl p-10 hover:border-purple-400/50 hover:bg-surface transition-all h-full group relative flex flex-col shadow-[0_0_20px_rgba(255,165,0,0.05)]">
                  <span className="absolute top-6 right-6 text-xs px-3 py-1 rounded-full bg-orange/10 text-orange font-semibold tracking-wide uppercase">
                    Plus Populaire
                  </span>
                  <div className="w-16 h-16 rounded-2xl bg-purple-400/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <Lightbulb size={28} className="text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white/90">
                    J&apos;ai juste l&apos;idée
                  </h3>
                  <p className="text-base text-muted/70 leading-relaxed mt-auto">
                    Décris simplement ton concept. On s&apos;occupe de tout le contenu et de l'analyse marché.
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ────────────── CE QUE ÇA CHANGE ────────────── */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Et après ?
            </h2>
            <p className="text-muted/80 text-xl max-w-2xl mx-auto">
              Ce n'est que le début. ivoire.io t'accompagne post-lancement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Ta page est en ligne",
                desc: "Une vitrine pro pour ta startup. Partageable en un lien clair, optimisée pour le SEO.",
              },
              {
                icon: Heart,
                title: "La communauté découvre",
                desc: "Les gens votent pour ton projet. Tu montes dans le classement et gagnes en visibilité.",
              },
              {
                icon: Users,
                title: "Tu recrutes",
                desc: "Publie des offres. Reçois des candidatures pertinentes. Fais des entretiens avec les meilleurs devs.",
              },
              {
                icon: Zap,
                title: "Smart Matching",
                desc: "Notre système connecte automatiquement ta startup aux développeurs et co-fondateurs compatibles.",
              },
              {
                icon: Shield,
                title: "Ton idée est horodatée",
                desc: "Preuve de création certifiée dès ton inscription. Tu peux prouver que l'idée de base est la tienne.",
              },
              {
                icon: Sparkles,
                title: "Dossier Investisseur",
                desc: "Business plan généré, prêt à être téléchargé et présenté pour préparer ta levée de fonds.",
              },
            ].map((f, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                key={f.title}
                className="bg-surface/30 backdrop-blur-sm border border-white/5 rounded-3xl p-8 hover:border-orange/20 transition-all group flex flex-col"
              >
                <div className="w-14 h-14 rounded-2xl bg-orange/10 flex items-center justify-center mb-6 group-hover:bg-orange text-orange group-hover:text-white transition-colors duration-500">
                  <f.icon size={26} />
                </div>
                <h3 className="text-xl font-bold text-white/90 mb-4">{f.title}</h3>
                <p className="text-muted/70 text-base leading-relaxed mt-auto">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────── CTA FINAL ────────────── */}
      <section className="py-32 px-4 mb-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center p-12 md:p-16 rounded-[40px] bg-gradient-to-b from-orange/10 to-surface/30 border border-orange/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-orange/10 blur-3xl opacity-50" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Une simple idée suffit.</h2>
              <p className="text-muted/80 text-xl md:text-2xl mb-12 font-light">On s&apos;occupe de tout le reste.</p>
              <Link href="/rejoindre/startup">
                <Button size="lg" className="h-14 px-10 text-lg font-semibold gap-3 shadow-[0_0_30px_rgba(255,165,0,0.3)] hover:shadow-[0_0_50px_rgba(255,165,0,0.5)] hover:scale-105 transition-all">
                  <Rocket size={20} />
                  Créer ma startup maintenant
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
