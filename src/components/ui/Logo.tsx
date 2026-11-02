import styles from "./Logo.module.css";

/**
 * One Time Product BD logo — "The Cup" (logo system 2a): a lidded cup carrying a negative "1",
 * the lowercase "onetime" wordmark, and the "product BD" tag.
 *
 * `tone="light"` is for paper/white backgrounds, `tone="dark"` the reversed version for dark ones.
 * On dark backgrounds the "1" is a cut-out, so pass the surface colour as `knockout`.
 * Everything scales from `size`, the wordmark's font size in px.
 */
interface LogoProps {
  /** `lockup` is the horizontal primary logo; `mark` is the cup alone. */
  variant?: "lockup" | "mark";
  tone?: "light" | "dark";
  /** Colour showing through the "1" in the reversed logo — the background behind it. */
  knockout?: string;
  size?: number;
  className?: string;
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 56 64" aria-hidden="true" focusable="false">
      <rect x="4" y="4" width="48" height="7" rx="3.5" fill="var(--logo-lid)" />
      <path d="M7 14 H49 L44 60 H12 Z" fill="var(--logo-cup)" stroke="var(--logo-cup)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M24 30 L30 25.5 V48" fill="none" stroke="var(--logo-one)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ variant = "lockup", tone = "light", knockout = "var(--logo-green)", size = 26, className = "" }: LogoProps) {
  const style = { fontSize: size, "--logo-knockout": knockout } as React.CSSProperties;
  const cls = `${styles.logo} ${tone === "dark" ? styles.dark : styles.light} ${className}`;

  if (variant === "mark") {
    return (
      <span className={cls} style={style} aria-hidden="true">
        <LogoMark className={styles.mark} />
      </span>
    );
  }

  return (
    <span className={cls} style={style} aria-hidden="true">
      <LogoMark className={styles.mark} />
      <span className={styles.words}>
        <span className={styles.name}>onetime</span>
        <span className={styles.sub}>
          <span className={styles.product}>product</span>
          <span className={styles.bd}>BD</span>
        </span>
      </span>
    </span>
  );
}
