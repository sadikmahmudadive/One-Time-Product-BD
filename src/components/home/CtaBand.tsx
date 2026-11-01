import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/Icons";
import styles from "./CtaBand.module.css";

export function CtaBand() {
  return (
    <section className={styles.band}>
      <div className={`wrap ${styles.inner}`}>
        <h2 className={`reveal ${styles.title}`}>
          Ready to pack <span className="it">beautifully?</span>
        </h2>
        <Link className={`btn reveal d2 ${styles.cta}`} href="/shop">
          Get started
          <ArrowRightIcon size={20} />
        </Link>
      </div>
    </section>
  );
}
