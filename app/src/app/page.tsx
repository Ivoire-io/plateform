import { FeaturesSection } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";
import { RoadmapSection } from "@/components/landing/roadmap";
import { SocialProof } from "@/components/landing/social-proof";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <SocialProof />
        <FeaturesSection />
        <RoadmapSection />
      </main>
      <Footer />
    </>
  );
}
