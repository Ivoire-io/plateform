import { FeaturesSection } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";
import { PreviewSection } from "@/components/landing/preview";
import { RoadmapSection } from "@/components/landing/roadmap";
import { SocialProof } from "@/components/landing/social-proof";
import { WaitlistSection } from "@/components/landing/waitlist";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <SocialProof />
        <FeaturesSection />
        <PreviewSection />
        <RoadmapSection />
        <Suspense>
          <WaitlistSection />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
