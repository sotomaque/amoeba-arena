import { HomeDecorations } from "@/components/HomeDecorations";
import { HomeHero } from "@/components/HomeHero";
import { HomeContent } from "@/components/HomeContent";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 ghibli-bg relative overflow-hidden">
      {/* Decorative floating elements - client component for animations */}
      <HomeDecorations />

      {/* Animated hero section - client component */}
      <HomeHero />

      {/* Forms and how-to-play - client component */}
      <HomeContent />
    </main>
  );
}
