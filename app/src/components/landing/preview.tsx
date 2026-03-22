"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function PreviewSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background glow to match the rest of the site */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange/5 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight">
          À quoi ressemble ton portfolio{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange to-red-500">ivoire.io</span> ?
        </h2>
        <p className="text-muted/90 text-lg mb-16 max-w-xl mx-auto font-light leading-relaxed">
          Un espace professionnel, moderne et à ton nom. Accessible partout pour impressionner tes clients et recruteurs.
        </p>

        {/* Portfolio screenshot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-4xl mx-auto group"
        >
          {/* Subtle Outer Glow that expands on hover */}
          <div className="absolute -inset-1 sm:-inset-4 bg-gradient-to-br from-orange/20 to-blue-500/20 rounded-[2rem] sm:rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="relative rounded-[1.5rem] sm:rounded-[2rem] p-2 sm:p-4 bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-[1.5rem] sm:rounded-[2rem] pointer-events-none" />
            <Image
              src="/example-porfolio-ivoire.io.webp"
              alt="Exemple de portfolio ivoire.io — john.ivoire.io"
              width={1200}
              height={900}
              className="relative rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl w-full h-auto object-cover"
              priority
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
