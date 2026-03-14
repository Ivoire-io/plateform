import Image from "next/image";

export function PreviewSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          À quoi ressemble ton portfolio{" "}
          <span className="text-orange">ivoire.io</span> ?
        </h2>
        <p className="text-muted mb-12 max-w-lg mx-auto">
          Un espace professionnel, moderne et à ton nom. Accessible partout.
        </p>

        {/* Portfolio screenshot */}
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute -inset-1 bg-orange/20 rounded-3xl blur-2xl" />
          <Image
            src="/example-porfolio-ivoire.io.webp"
            alt="Exemple de portfolio ivoire.io — john.ivoire.io"
            width={1200}
            height={900}
            className="relative rounded-2xl border border-border shadow-2xl shadow-orange/10 w-full h-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
}
