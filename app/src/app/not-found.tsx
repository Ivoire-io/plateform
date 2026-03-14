import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-bold mb-3">Page introuvable</h1>
        <p className="text-muted mb-8">
          Ce profil n&apos;existe pas encore sur ivoire.io.
          <br />
          Tu veux le réclamer ?
        </p>
        <Link href="/#rejoindre">
          <Button>Réclamer ce sous-domaine</Button>
        </Link>
      </div>
    </div>
  );
}
