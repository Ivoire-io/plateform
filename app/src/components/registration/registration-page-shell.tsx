import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type RegistrationPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  children: ReactNode;
};

export function RegistrationPageShell({
  eyebrow,
  title,
  description,
  backHref,
  backLabel,
  children,
}: RegistrationPageShellProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors min-w-0"
          >
            <ArrowLeft size={16} />
            <span className="truncate">{backLabel}</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange/20 bg-orange/5 text-orange text-[11px] mb-3 uppercase tracking-[0.16em]">
            {eyebrow}
          </div>
          <Link href="/" className="text-sm font-semibold tracking-tight text-white shrink-0">
            <span>ivoire</span>
            <span className="text-orange">.io</span>
          </Link>
        </div>
      </div>

      {children}
    </main>
  );
}