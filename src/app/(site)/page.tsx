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

export default function HomePage() {
  return (
    <>
      <IntroLoader />
      <ChapterIndex />
      <Hero />
      <Marquee />
      <RangeSection />
      <MadeForSection />
      <SizesSection />
      <SignatureSection />
      <ShopSection />
      <BulkSection />
      <CtaBand />
    </>
  );
}
