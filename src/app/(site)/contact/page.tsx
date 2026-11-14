import type { Metadata } from "next";
import { ContactDetailsCard } from "@/components/contact/ContactDetailsCard";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageHero } from "@/components/ui/PageHero";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Contact — One Time Product BD",
  description: "Reach One Time Product BD by WhatsApp, phone, email or the contact form.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        title="Get in"
        accent="touch."
        lede="Questions about a size, a pack or a bulk order? Reach us the way that suits you."
      />
      <div className={`wrap ${styles.layout}`}>
        <ContactDetailsCard />
        <ContactForm />
      </div>
    </>
  );
}
