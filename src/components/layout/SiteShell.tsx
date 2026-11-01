import { Toast } from "@/components/cart/Toast";
import { ScrollMotion } from "@/components/motion/ScrollMotion";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** Header, footer, toast and scroll motion around a page — shared by every route, including 404. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface-50)", overflowX: "clip", minHeight: "100vh" }}>
      <ScrollMotion />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <Toast />
    </div>
  );
}
