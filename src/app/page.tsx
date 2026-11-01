import { Toast } from "@/components/cart/Toast";
import { BulkSection } from "@/components/home/BulkSection";
import { CtaBand } from "@/components/home/CtaBand";
import { Hero } from "@/components/home/Hero";
import { MadeForSection } from "@/components/home/MadeForSection";
import { Marquee } from "@/components/home/Marquee";
import { RangeSection } from "@/components/home/RangeSection";
import { ShopSection } from "@/components/home/ShopSection";
import { SignatureSection } from "@/components/home/SignatureSection";
import { SizesSection } from "@/components/home/SizesSection";
import { ChapterIndex } from "@/components/layout/ChapterIndex";
import { IntroLoader } from "@/components/layout/IntroLoader";
import { ScrollMotion } from "@/components/motion/ScrollMotion";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function HomePage() {
  return (
    <div style={{ background: "var(--surface-50)", overflowX: "clip", minHeight: "100vh" }}>
      <ScrollMotion />
      <IntroLoader />
      <SiteHeader />
      <ChapterIndex />
      <main>
        <Hero />
        <Marquee />
        <RangeSection />
        <MadeForSection />
        <SizesSection />
        <SignatureSection />
        <ShopSection />
        <BulkSection />
        <CtaBand />
      </main>
      <SiteFooter />
      <Toast />
    </div>
  );
}
