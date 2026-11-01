import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/ui/PageHero";

export default function NotFound() {
  return (
    <SiteShell>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Page not found" }]}
        title="That page"
        accent="isn’t here."
        lede="The link may be old, or the product may have moved. Head back to the shop or the home page."
      >
        <Link className="btn btn-lime" href="/shop">
          Browse the shop
        </Link>
        <Link className="btn btn-ghost" href="/">
          Go home
        </Link>
      </PageHero>
    </SiteShell>
  );
}
