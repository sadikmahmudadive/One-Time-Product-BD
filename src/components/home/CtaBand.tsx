"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { useLanguage } from "@/lib/i18n/context";
import styles from "./CtaBand.module.css";

export function CtaBand() {
  const { pick } = useLanguage();

  return (
    <section className={styles.band}>
      <div className={`wrap ${styles.inner}`}>
        <h2 className={`reveal ${styles.title}`}>
          {pick("Ready to pack", "নিখুঁত প্যাকেজিংয়ে")}{" "}
          <span className="it">{pick("beautifully?", "প্রস্তুত তো?")}</span>
        </h2>
        <Link className={`btn reveal d2 ${styles.cta}`} href="/shop">
          {pick("Get started", "শুরু করুন")}
          <ArrowRightIcon size={20} />
        </Link>
      </div>
    </section>
  );
}
