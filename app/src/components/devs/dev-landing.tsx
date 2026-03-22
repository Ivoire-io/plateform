"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Briefcase,
  Code,
  Eye,
  Globe,
  MessageSquare,
  Rocket,
  Star,
  Users,
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

export function DevLanding() {
  return (
    <div className="pt-16">
      {/* ────────────── HERO ────────────── */}
      <section className="min-h-[85vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Background glow ultra-léger */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange/10 rounded-full blur-[120px] -z-10 opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-orange)_0%,_transparent_60%)] opacity-[0.05] -z-10 pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center mt-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer as any}
        >
          <motion.div variants={fadeUp as any} className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange/20 bg-orange/5 text-orange text-sm font-medium">
            <Code size={14} />
            Pour les Développeurs 🇨🇮
          </motion.div>

          <motion.h1 variants={fadeUp as any} className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-8">
            Ton nom.
            <span className="text-orange">ivoire.io</span>
          </motion.h1>

          <motion.p variants={fadeUp as any} className="text-muted/80 text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            Un portfolio pro, une visibilité réelle, des opportunités qui viennent à toi. <strong className="text-white font-semibold">Gratuit.</strong>
          </motion.p>

          <motion.div variants={fadeUp as any} className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link href="/rejoindre/developpeur">
              <Button size="lg" className="h-14 px-8 text-base font-semibold gap-2 shadow-[0_0_30px_rgba(255,165,0,0.3)] hover:shadow-[0_0_40px_rgba(255,165,0,0.4)] transition-all">
                <Rocket size={20} />
                Réclamer mon sous-domaine
              </Button>
            </Link>
            <Link href="/devs">
              <Button variant="outline" size="lg" className="h-14 px-8 text-base font-medium hover:bg-surface border-white/10">
                Voir l&apos;annuaire
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ────────────── LE PROBLÈME ────────────── */}
      <section className="py-32 px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-10 leading-tight"
          >
            LinkedIn est trop vague.
            <br />
            GitHub est trop technique.
            <br />
            <span className="text-orange text-5xl md:text-6xl mt-4 block">Il te faut un entre-deux.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted/80 text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Un endroit qui te représente vraiment : tes projets bien exposés, tes compétences claires, ta disponibilité à jour. Le tout centralisé pour ceux qui recrutent en Côte d'Ivoire.
          </motion.p>
        </div>
      </section>

      {/* ────────────── CE QUE TU OBTIENS ────────────── */}
      <section className="py-32 px-4 bg-surface/20 border-y border-white/5 relative">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Ce que ça change pour toi
            </h2>
            <p className="text-muted/70 max-w-2xl mx-auto text-lg">
              Une plateforme conçue pour te mettre en avant et optimiser tes chances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Un sous-domaine à ton nom",
                desc: "konan.ivoire.io — ton adresse pro. Mémorable, partageable, à toi, et ultra professionnel face aux recruteurs.",
              },
              {
                icon: Eye,
                title: "Tu es visible",
                desc: "Ton profil apparaît dans le grand annuaire national. Les startups et recruteurs te trouvent par mots-clés.",
              },
              {
                icon: Code,
                title: "Tes projets parlent pour toi",
                desc: "Montre ce que tu as construit. Un vrai catalogue de tes réalisations plutôt qu'un simple CV papier classique.",
              },
              {
                icon: MessageSquare,
                title: "On te contacte directement",
                desc: "Fini les intermédiaires. Les entreprises t'écrivent directement via la plateforme pour des opportunités.",
              },
              {
                icon: Star,
                title: "Ta crédibilité grandit",
                desc: "Avis vérifiés, badges de compétences, portfolio. Tu construis ta réputation dans l'écosystème.",
              },
              {
                icon: Briefcase,
                title: "Les offres viennent à toi",
                desc: "Emplois CDI, missions freelance, ou collaborations. Remplis ton profil et laisse les offres arriver.",
              },
            ].map((f, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                key={f.title}
                className="bg-surface/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8 hover:border-orange/30 hover:bg-surface transition-all group flex flex-col h-full"
              >
                <div className="w-14 h-14 rounded-2xl bg-orange/10 flex items-center justify-center mb-6 group-hover:bg-orange text-orange group-hover:text-white transition-colors duration-500 shadow-sm">
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

      {/* ────────────── L'ÉCOSYSTÈME ────────────── */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="max-w-[1000px] mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
            Tu n&apos;es pas seul.
          </h2>
          <p className="text-muted/80 text-xl max-w-2xl mx-auto mb-16 leading-relaxed">
            ivoire.io c&apos;est un écosystème en pleine croissance. <br className="hidden md:block" />
            Plus il y a d&apos;acteurs, plus il y a d&apos;opportunités créées pour toi.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10">
            {[
              { icon: Users, label: "Développeurs", color: "text-blue-400", bg: "bg-blue-400/10", border: "hover:border-blue-400/30" },
              { icon: Rocket, label: "Startups", color: "text-orange", bg: "bg-orange/10", border: "hover:border-orange/30" },
              { icon: Briefcase, label: "Entreprises", color: "text-purple-400", bg: "bg-purple-400/10", border: "hover:border-purple-400/30" },
            ].map((item, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                key={item.label}
                className={`bg-surface/30 backdrop-blur-md border border-white/5 rounded-3xl p-10 flex flex-col items-center justify-center transition-all ${item.border}`}
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${item.bg}`}>
                  <item.icon size={32} className={`${item.color}`} />
                </div>
                <p className="text-xl font-semibold text-white/90">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────── CTA FINAL ────────────── */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-12 md:p-16 rounded-[40px] bg-gradient-to-b from-orange/10 to-surface/30 border border-orange/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-orange/5 blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
                Réclame ton adresse <br className="md:hidden" /><span className="text-orange">.ivoire.io</span>
              </h2>
              <p className="text-muted/80 text-xl mb-10 font-light">
                C'est gratuit. Ta nouvelle vie pro commence ici.
              </p>
              <Link href="/rejoindre/developpeur">
                <Button size="lg" className="h-14 px-10 text-lg font-semibold gap-3 shadow-[0_0_30px_rgba(255,165,0,0.3)] hover:shadow-[0_0_50px_rgba(255,165,0,0.5)] hover:scale-105 transition-all">
                  <Rocket size={20} />
                  Créer mon portfolio en 2 min
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
