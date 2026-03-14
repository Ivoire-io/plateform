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

        {/* Browser mockup */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl shadow-orange/5 max-w-3xl mx-auto">
          {/* Browser bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-background border border-border rounded-md px-4 py-1 text-sm font-mono text-muted">
                ulrich.ivoire.io
              </div>
            </div>
          </div>

          {/* Mock portfolio content */}
          <div className="p-8 md:p-12 text-left">
            <div className="flex items-start gap-6 mb-8">
              {/* Avatar placeholder */}
              <div className="w-20 h-20 rounded-2xl bg-orange/20 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">👨‍💻</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Ulrich Kouamé</h3>
                <p className="text-orange font-medium">Lead Developer</p>
                <p className="text-muted text-sm mt-1">
                  📍 Abidjan, Côte d&apos;Ivoire
                </p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {["Flutter", "Dart", "Firebase", "React", "TypeScript"].map(
                    (skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-border/50 rounded-md text-xs text-muted font-mono"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Mock projects */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {["E-Commerce App", "Chat Platform", "Analytics"].map(
                (project) => (
                  <div
                    key={project}
                    className="bg-background border border-border rounded-xl p-4"
                  >
                    <div className="w-full h-20 bg-border/30 rounded-lg mb-3" />
                    <p className="font-medium text-sm">{project}</p>
                    <p className="text-muted text-xs mt-1">Flutter · React</p>
                  </div>
                )
              )}
            </div>

            {/* CTA */}
            <div className="mt-8 flex justify-center">
              <div className="px-6 py-2.5 bg-orange rounded-lg text-white text-sm font-medium">
                Me contacter
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
