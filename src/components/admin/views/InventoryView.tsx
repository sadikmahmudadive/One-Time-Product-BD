"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PRODUCTS, getCategory, priceLabel } from "@/lib/catalog";
import type { Product } from "@/lib/catalog";
import { uploadClientImage, buildCloudinaryUrl } from "@/lib/cloudinary/client";
import type { InventoryRecord } from "@/lib/firebase/firestore";
import { ProductShape } from "@/components/ui/ProductShape";
import { EmptyState, Icon, PageHeader, Panel, SearchField, Segmented, StatCard, Tone } from "../ui";
import styles from "../admin.module.css";

type StockFilter = "all" | "attention" | "healthy" | "untracked";
type Health = "untracked" | "out" | "low" | "healthy";

const DEFAULT_ALERT = 10;

export function stockHealth(record: InventoryRecord | undefined): Health {
  if (!record) return "untracked";
  if (record.available <= 0) return "out";
  if (record.available <= record.lowStockAt) return "low";
  return "healthy";
}

interface InventoryViewProps {
  inventory: InventoryRecord[];
  onSave: (slug: string, available: number, lowStockAt: number, imageUrl?: string) => Promise<void>;
  onExport: () => void;
  notify: (tone: "success" | "error", text: string) => void;
}

export function InventoryView({ inventory, onSave, onExport, notify }: InventoryViewProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");

  const byslug = useMemo(() => new Map(inventory.map((i) => [i.slug, i])), [inventory]);
  const rows = PRODUCTS.map((p) => ({ product: p, record: byslug.get(p.slug), health: stockHealth(byslug.get(p.slug)) }));

  const count = (h: Health[]) => rows.filter((r) => h.includes(r.health)).length;
  const q = search.trim().toLowerCase();
  const visible = rows.filter((r) => {
    if (q && !r.product.name.toLowerCase().includes(q) && !r.product.category.includes(q)) return false;
    if (filter === "attention") return r.health === "low" || r.health === "out";
    if (filter === "healthy") return r.health === "healthy";
    if (filter === "untracked") return r.health === "untracked";
    return true;
  });

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Inventory"
        description="Set stock levels and alert thresholds, and manage product photos."
        actions={
          <button type="button" className={styles.btn} onClick={onExport}>
            <Icon name="download" size={16} /> Export CSV
          </button>
        }
      />

      <div className={styles.statGrid}>
        <StatCard label="Healthy" value={String(count(["healthy"]))} icon="check" hint={<span className={styles.deltaNone}>Above the alert level</span>} />
        <StatCard label="Running low" value={String(count(["low"]))} icon="alert" hint={<span className={styles.deltaNone}>At or below the alert level</span>} />
        <StatCard label="Out of stock" value={String(count(["out"]))} icon="inventory" hint={<span className={styles.deltaNone}>No units available</span>} />
        <StatCard label="Not tracked" value={String(count(["untracked"]))} icon="inbox" hint={<span className={styles.deltaNone}>No stock set yet</span>} />
      </div>

      <Panel flush>
        <div className={styles.toolbar}>
          <SearchField label="Search products" placeholder="Search by name or category" value={search} onChange={setSearch} />
          <Segmented<StockFilter>
            label="Filter by stock"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All", count: rows.length },
              { value: "attention", label: "Needs attention", count: count(["low", "out"]) },
              { value: "healthy", label: "Healthy", count: count(["healthy"]) },
              { value: "untracked", label: "Not tracked", count: count(["untracked"]) },
            ]}
          />
        </div>

        {visible.length === 0 ? (
          <EmptyState title="No products match" text="Try a different search or filter." />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Status</th>
                  <th scope="col" className={styles.num}>
                    In stock
                  </th>
                  <th scope="col" className={styles.num}>
                    Alert at
                  </th>
                  <th scope="col">
                    <span className={styles.visuallyHidden}>Save</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <InventoryRow key={r.product.slug} product={r.product} record={r.record} health={r.health} onSave={onSave} notify={notify} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

const HEALTH_BADGE: Record<Health, { tone: "success" | "warning" | "danger" | "neutral"; label: string }> = {
  healthy: { tone: "success", label: "Healthy" },
  low: { tone: "warning", label: "Running low" },
  out: { tone: "danger", label: "Out of stock" },
  untracked: { tone: "neutral", label: "Not tracked" },
};

function InventoryRow({
  product,
  record,
  health,
  onSave,
  notify,
}: {
  product: Product;
  record: InventoryRecord | undefined;
  health: Health;
  onSave: InventoryViewProps["onSave"];
  notify: InventoryViewProps["notify"];
}) {
  const [available, setAvailable] = useState(record?.available ?? 0);
  const [alertAt, setAlertAt] = useState(record?.lowStockAt ?? DEFAULT_ALERT);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Keep the inputs in step with what was last saved.
  useEffect(() => {
    setAvailable(record?.available ?? 0);
    setAlertAt(record?.lowStockAt ?? DEFAULT_ALERT);
  }, [record]);

  const dirty = available !== (record?.available ?? 0) || alertAt !== (record?.lowStockAt ?? DEFAULT_ALERT) || (!record && (available !== 0 || alertAt !== DEFAULT_ALERT));
  const image = record?.imageUrl || product.image;
  const badge = HEALTH_BADGE[health];

  async function save() {
    setSaving(true);
    try {
      await onSave(product.slug, available, alertAt, record?.imageUrl);
    } finally {
      setSaving(false);
    }
  }

  async function upload(file: File) {
    setUploading(true);
    try {
      const result = await uploadClientImage(file);
      await onSave(product.slug, record?.available ?? available, record?.lowStockAt ?? alertAt, result.secureUrl);
    } catch (err) {
      notify("error", `Photo upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <tr>
      <td>
        <div className={styles.productCell}>
          <button type="button" className={styles.thumb} onClick={() => fileRef.current?.click()} aria-label={`Change photo for ${product.name}`} disabled={uploading}>
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={buildCloudinaryUrl(image, { width: 96, height: 96, crop: "fill" })} alt="" />
            ) : (
              <ProductShape kind={product.kind} />
            )}
            <span className={styles.thumbHint}>{uploading ? "…" : <Icon name="upload" size={14} />}</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <div>
            <div className={styles.cellStrong}>{product.name}</div>
            <div className={styles.sub}>
              {getCategory(product.category)?.short} · {priceLabel(product)}
            </div>
          </div>
        </div>
      </td>
      <td>
        <Tone tone={badge.tone}>
          <span className={styles.badgeDot} aria-hidden="true" />
          {badge.label}
        </Tone>
      </td>
      <td className={styles.num}>
        <div className={styles.stockInput}>
          <input type="number" min={0} inputMode="numeric" aria-label={`Units in stock for ${product.name}`} value={available} onChange={(e) => setAvailable(Math.max(0, Math.floor(Number(e.target.value)) || 0))} />
          <button type="button" aria-label="Add 10" onClick={() => setAvailable((v) => v + 10)}>
            +10
          </button>
        </div>
      </td>
      <td className={styles.num}>
        <div className={styles.stockInput}>
          <input type="number" min={0} inputMode="numeric" aria-label={`Low stock alert level for ${product.name}`} value={alertAt} onChange={(e) => setAlertAt(Math.max(0, Math.floor(Number(e.target.value)) || 0))} />
        </div>
      </td>
      <td className={styles.rowActions}>
        <button type="button" className={`${styles.btnSm} ${dirty ? styles.btnPrimary : ""}`} disabled={!dirty || saving} onClick={save}>
          {saving ? "Saving…" : record && !dirty ? "Saved" : "Save"}
        </button>
      </td>
    </tr>
  );
}
