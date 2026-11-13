"use client";

import type { ReactNode } from "react";
import styles from "./admin.module.css";

export type IconName =
  | "overview"
  | "orders"
  | "quotes"
  | "inventory"
  | "media"
  | "customers"
  | "refresh"
  | "search"
  | "external"
  | "download"
  | "print"
  | "chat"
  | "phone"
  | "close"
  | "menu"
  | "check"
  | "alert"
  | "up"
  | "down"
  | "chevron"
  | "upload"
  | "image"
  | "copy"
  | "logout"
  | "table"
  | "board"
  | "inbox";

const PATHS: Record<IconName, ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  orders: (
    <>
      <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
      <path d="M3 7.5 12 12l9-4.5M12 12v9" />
    </>
  ),
  quotes: (
    <>
      <path d="M4 5h16v11H9.5L5 20v-4H4z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>
  ),
  inventory: (
    <>
      <path d="M3 9l9-5 9 5-9 5z" />
      <path d="M3 9v6l9 5 9-5V9" />
    </>
  ),
  media: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="m21 16-5-5-8 8" />
    </>
  ),
  customers: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19c.6-3.3 3-5 6-5s5.4 1.7 6 5" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.4c1.8.6 2.7 2.2 3 4.6" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 0 0-14.3-4.5L4 8.5" />
      <path d="M4 4v4.5h4.5" />
      <path d="M4 13a8 8 0 0 0 14.3 4.5l1.7-2" />
      <path d="M20 20v-4.5h-4.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.8-3.8" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 10 14" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11" />
      <path d="m7 10.5 5 5 5-5" />
      <path d="M5 19.5h14" />
    </>
  ),
  print: (
    <>
      <path d="M7 9V4h10v5" />
      <rect x="4" y="9" width="16" height="8" rx="2" />
      <path d="M7 14h10v6H7z" />
    </>
  ),
  chat: <path d="M4 5h16v11H10l-5 4v-4H4z" />,
  phone: <path d="M5 4h4l1.5 4.5-2.2 1.4a11 11 0 0 0 5.8 5.8l1.4-2.2L20 15v4a1 1 0 0 1-1 1C10.7 20 4 13.3 4 5a1 1 0 0 1 1-1z" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alert: (
    <>
      <path d="M12 4 3 19h18z" />
      <path d="M12 10v4.2M12 17h.01" />
    </>
  ),
  up: <path d="M12 19V6M6.5 11.5 12 6l5.5 5.5" />,
  down: <path d="M12 5v13M6.5 12.5 12 18l5.5-5.5" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  upload: (
    <>
      <path d="M12 16V5" />
      <path d="m7 9.5 5-5 5 5" />
      <path d="M5 19.5h14" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="m21 16-5-5-8 8" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 8l-4 4 4 4M6 12h10" />
    </>
  ),
  table: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M3 15h18M10 4v16" />
    </>
  ),
  board: (
    <>
      <rect x="3" y="4" width="5" height="16" rx="1.5" />
      <rect x="9.5" y="4" width="5" height="10" rx="1.5" />
      <rect x="16" y="4" width="5" height="13" rx="1.5" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 13l2.5-8h11L20 13v6H4z" />
      <path d="M4 13h4.5a3.5 3.5 0 0 0 7 0H20" />
    </>
  ),
};

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={styles.icon}
    >
      {PATHS[name]}
    </svg>
  );
}

/* ---------- Status badges: a dot plus a word, never colour alone ---------- */

type Tone = "warning" | "info" | "success" | "danger" | "neutral" | "accent";

const TONES: Record<string, { tone: Tone; label: string }> = {
  pending: { tone: "warning", label: "Pending" },
  confirmed: { tone: "info", label: "Confirmed" },
  shipped: { tone: "success", label: "Shipped" },
  cancelled: { tone: "danger", label: "Cancelled" },
  new: { tone: "accent", label: "New" },
  in_progress: { tone: "warning", label: "In progress" },
  completed: { tone: "success", label: "Completed" },
  archived: { tone: "neutral", label: "Archived" },
  quote: { tone: "info", label: "Quote" },
  contact: { tone: "neutral", label: "Message" },
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const meta = TONES[status] ?? { tone: "neutral" as Tone, label: status };
  return (
    <span className={`${styles.badge} ${styles[`tone_${meta.tone}`]}`}>
      <span className={styles.badgeDot} aria-hidden="true" />
      {label ?? meta.label}
    </span>
  );
}

export function Tone({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`${styles.badge} ${styles[`tone_${tone}`]}`}>{children}</span>;
}

/* ---------- Layout primitives ---------- */

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h2 className={styles.pageTitle}>{title}</h2>
        {description && <p className={styles.pageDesc}>{description}</p>}
      </div>
      {actions && <div className={styles.pageActions}>{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  flush,
  className = "",
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  /** No inner padding — for tables that run edge to edge. */
  flush?: boolean;
  className?: string;
}) {
  return (
    <section className={`${styles.panel} ${className}`}>
      {(title || actions) && (
        <header className={styles.panelHead}>
          <div>
            {title && <h3 className={styles.panelTitle}>{title}</h3>}
            {description && <p className={styles.panelDesc}>{description}</p>}
          </div>
          {actions && <div className={styles.panelActions}>{actions}</div>}
        </header>
      )}
      <div className={flush ? styles.panelFlush : styles.panelBody}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  delta,
  deltaLabel,
  icon,
  badge,
  active,
  onClick,
}: {
  label: string;
  value: string;
  hint?: ReactNode;
  /** Percent change vs the previous period. `undefined` hides it, `null` shows "no earlier data". */
  delta?: number | null;
  deltaLabel?: string;
  icon: IconName;
  badge?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const isClickable = Boolean(onClick);
  const Tag = isClickable ? "button" : "article";

  return (
    <Tag
      className={`${styles.stat} ${isClickable ? styles.statInteractive : ""} ${active ? styles.statInteractiveActive : ""}`}
      onClick={onClick}
      type={isClickable ? "button" : undefined}
    >
      <div className={styles.statTop}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className={styles.statLabel}>{label}</span>
          {badge && <span className={styles.statPill}>{badge}</span>}
        </div>
        <span className={styles.statIcon}>
          <Icon name={icon} size={18} />
        </span>
      </div>
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statFoot}>
        {delta !== undefined &&
          (delta === null ? (
            <span className={styles.deltaNone}>No earlier period</span>
          ) : (
            <span className={`${styles.delta} ${delta >= 0 ? styles.deltaUp : styles.deltaDown}`}>
              <Icon name={delta >= 0 ? "up" : "down"} size={13} />
              {Math.abs(delta)}%
              <span className={styles.visuallyHidden}>{delta >= 0 ? " increase" : " decrease"}</span>
            </span>
          ))}
        {delta !== undefined && delta !== null && deltaLabel && <span className={styles.deltaLabel}>{deltaLabel}</span>}
        {hint}
      </p>
    </Tag>
  );
}

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className={styles.segmented} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`${styles.segBtn} ${value === o.value ? styles.segOn : ""}`}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
          {o.count !== undefined && <span className={styles.segCount}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <label className={styles.search}>
      <span className={styles.visuallyHidden}>{label}</span>
      <Icon name="search" size={17} />
      <input type="search" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function EmptyState({ icon = "inbox", title, text, action }: { icon?: IconName; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>
        <Icon name={icon} size={22} />
      </span>
      <p className={styles.emptyTitle}>{title}</p>
      {text && <p className={styles.emptyText}>{text}</p>}
      {action}
    </div>
  );
}

export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <span className={styles.avatar} aria-hidden="true">
      {initials || "?"}
    </span>
  );
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className={styles.skeletons} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <span key={i} className={styles.skeleton} style={{ width: `${92 - (i % 3) * 14}%` }} />
      ))}
    </div>
  );
}
