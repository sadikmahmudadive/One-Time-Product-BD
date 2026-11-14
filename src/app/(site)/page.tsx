import { BulkSection } from "@/components/home/BulkSection";
import { CategoryBento } from "@/components/home/CategoryBento";
import { CtaBand } from "@/components/home/CtaBand";
import { Hero } from "@/components/home/Hero";
import { MadeForSection } from "@/components/home/MadeForSection";
import { Marquee } from "@/components/home/Marquee";
import { RangeSection } from "@/components/home/RangeSection";
import { ShopSection } from "@/components/home/ShopSection";
import { SignatureSection } from "@/components/home/SignatureSection";
import { SizesSection } from "@/components/home/SizesSection";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ChapterIndex } from "@/components/layout/ChapterIndex";
import { IntroLoader } from "@/components/layout/IntroLoader";

export default function HomePage() {
  return (
    <>
      <IntroLoader />
      <ChapterIndex />
      <Hero />
      <TrustStrip />
      <CategoryBento />
      <ShopSection />
      <Marquee />
      <RangeSection />
      <MadeForSection />
      <SizesSection />
      <SignatureSection />
      <BulkSection />
      <CtaBand />
    </>
  );
}
