import { FeaturesSection } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";
import { PreviewSection } from "@/components/landing/preview";
import { RoadmapSection } from "@/components/landing/roadmap";
import { WaitlistSection } from "@/components/landing/waitlist";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PreviewSection />
        <RoadmapSection />
        <WaitlistSection />
      </main>
      <Footer />
    </>
  );
}
