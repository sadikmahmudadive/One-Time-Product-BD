"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, priceLabel, lowestPrice, type CategoryId, type Product, type Variant } from "@/lib/catalog";
import type { ShapeKind } from "@/lib/content";
import { buildCloudinaryUrl, uploadClientImage } from "@/lib/cloudinary/client";
import { ProductShape } from "@/components/ui/ProductShape";
import { formatPrice } from "@/lib/format";
import { EmptyState, Icon, PageHeader, Panel, SearchField, Segmented, StatCard } from "../ui";
import styles from "../admin.module.css";

interface ProductsViewProps {
  products: Product[];
  loading: boolean;
  onSave: (product: Product) => Promise<void>;
  onDelete: (slug: string) => Promise<void>;
  onSeed: () => Promise<void>;
  onExport: () => void;
  notify: (tone: "success" | "error", text: string) => void;
}

export function ProductsView({
  products,
  loading,
  onSave,
  onDelete,
  onSeed,
  onExport,
  notify,
}: ProductsViewProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const q = search.trim().toLowerCase();
  const visible = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, categoryFilter, q]);

  const inStockCount = products.filter((p) => (p.available ?? 1) > (p.lowStockAt ?? 0)).length;
  const lowStockCount = products.filter((p) => {
    const avail = p.available ?? 1;
    const thresh = p.lowStockAt ?? 10;
    return avail > 0 && avail <= thresh;
  }).length;
  const outOfStockCount = products.filter((p) => p.available === 0).length;

  async function handleSeed() {
    if (!confirm("This will upload or update all base catalogue products in Cloud Firestore. Continue?")) return;
    try {
      setSeeding(true);
      await onSeed();
    } catch {
      // onSeed in AdminDashboard already notifies with exact error
    } finally {
      setSeeding(false);
    }
  }

  async function handleDelete(slug: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}" (${slug}) from the catalogue?`)) return;
    try {
      await onDelete(slug);
      notify("success", `Deleted "${name}".`);
    } catch {
      notify("error", `Failed to delete product "${name}".`);
    }
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Products & Catalogue"
        description="Manage catalogue items, BDT prices, pack variants, and Cloudinary media."
        actions={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className={styles.btn}
              onClick={handleSeed}
              disabled={seeding || loading}
              title="Copy default catalog items to Firestore"
            >
              <Icon name="refresh" size={16} />
              {seeding ? "Syncing…" : "Sync Catalogue to Firestore"}
            </button>
            <button type="button" className={styles.btn} onClick={onExport}>
              <Icon name="download" size={16} /> Export CSV
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => setIsCreating(true)}
            >
              + Add Product
            </button>
          </div>
        }
      />

      <div className={styles.statGrid}>
        <StatCard
          label="Total Products"
          value={String(products.length)}
          icon="inventory"
          hint={<span className={styles.deltaNone}>Across 4 packaging categories</span>}
        />
        <StatCard
          label="In Stock"
          value={String(inStockCount)}
          icon="check"
          hint={<span className={styles.deltaNone}>Healthy warehouse inventory</span>}
        />
        <StatCard
          label="Low / Out of Stock"
          value={String(lowStockCount + outOfStockCount)}
          icon="alert"
          hint={<span className={styles.deltaNone}>{outOfStockCount} zero stock, {lowStockCount} running low</span>}
        />
        <StatCard
          label="Direct Buy Items"
          value={String(products.filter((p) => p.price !== null).length)}
          icon="orders"
          hint={<span className={styles.deltaNone}>Single-price instant checkout</span>}
        />
      </div>

      <Panel flush>
        <div className={styles.toolbar}>
          <SearchField
            label="Search products"
            placeholder="Search by product name or slug…"
            value={search}
            onChange={setSearch}
          />
          <Segmented<string>
            label="Filter by category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: "all", label: "All Categories", count: products.length },
              ...CATEGORIES.map((c) => ({
                value: c.id,
                label: c.short,
                count: products.filter((p) => p.category === c.id).length,
              })),
            ]}
          />
        </div>

        {visible.length === 0 ? (
          <EmptyState title="No products found" text="Try a different search term or category filter." />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col" style={{ width: 64 }}>Preview</th>
                  <th scope="col">Product Name & Summary</th>
                  <th scope="col">Category</th>
                  <th scope="col">Pricing</th>
                  <th scope="col">Stock Status</th>
                  <th scope="col" style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => {
                  const avail = p.available ?? 0;
                  const thresh = p.lowStockAt ?? 10;
                  const isOut = p.available !== undefined && avail === 0;
                  const isLow = p.available !== undefined && avail > 0 && avail <= thresh;

                  return (
                    <tr key={p.slug}>
                      <td>
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 8,
                            overflow: "hidden",
                            background: "var(--surface-muted, #f4f7f4)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid var(--line-200, #e2e8e2)",
                          }}
                        >
                          {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={buildCloudinaryUrl(p.image, { width: 104, height: 104, crop: "fill" })}
                              alt={p.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div style={{ width: 38, height: 38 }}>
                              <ProductShape kind={p.kind} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontWeight: 600, color: "var(--ink-950, #0c1d17)" }}>
                            {p.name}
                          </span>
                          <span style={{ fontSize: 12, color: "var(--ink-500, #61776d)" }}>
                            <code style={{ background: "#f0f4f1", padding: "1px 5px", borderRadius: 4 }}>
                              {p.slug}
                            </code>
                            {p.capacityMl ? ` · ${p.capacityMl} ml` : ""}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 6,
                            background: "#edf4ee",
                            color: "#1f5f3e",
                            textTransform: "capitalize",
                          }}
                        >
                          {p.category.replace("-", " ")}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-900)" }}>
                          {priceLabel(p)}
                        </div>
                        {p.variants && p.variants.length > 0 && (
                          <div style={{ fontSize: 11, color: "var(--ink-500)" }}>
                            {p.variants.length} pack variants
                          </div>
                        )}
                      </td>
                      <td>
                        {p.available === undefined ? (
                          <span style={{ fontSize: 12, color: "var(--ink-400)" }}>Untracked</span>
                        ) : isOut ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#b91c1c" }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} />
                            Out of stock (0)
                          </span>
                        ) : isLow ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#b45309" }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b" }} />
                            Low ({avail} left)
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#047857" }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981" }} />
                            In stock ({avail})
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                          <button
                            type="button"
                            className={styles.btnSm}
                            onClick={() => setEditingProduct(p)}
                          >
                            Edit
                          </button>
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            className={styles.btnSm}
                            title="View on Storefront"
                          >
                            <Icon name="external" size={13} />
                          </Link>
                          <button
                            type="button"
                            className={`${styles.btnSm} ${styles.btnDanger}`}
                            onClick={() => handleDelete(p.slug, p.name)}
                            title="Delete product"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {(isCreating || editingProduct) && (
        <ProductDrawer
          product={editingProduct}
          onClose={() => {
            setIsCreating(false);
            setEditingProduct(null);
          }}
          onSave={async (saved) => {
            await onSave(saved);
            setIsCreating(false);
            setEditingProduct(null);
            notify("success", `Product "${saved.name}" saved to Firestore.`);
          }}
          notify={notify}
        />
      )}
    </div>
  );
}

/* ==============================================================================
   PRODUCT DRAWER / MODAL
   ============================================================================== */

interface ProductDrawerProps {
  product: Product | null;
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
  notify: (tone: "success" | "error", text: string) => void;
}

function ProductDrawer({ product, onClose, onSave, notify }: ProductDrawerProps) {
  const isEdit = Boolean(product);
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [category, setCategory] = useState<CategoryId>(product?.category || "square");
  const [kind, setKind] = useState<ShapeKind>(product?.kind || "square");
  const [summary, setSummary] = useState(product?.summary || "");
  const [image, setImage] = useState(product?.image || "");
  const [capacityMl, setCapacityMl] = useState<string>(product?.capacityMl ? String(product?.capacityMl) : "");
  const [isVariantProduct, setIsVariantProduct] = useState(Boolean(product?.variants?.length));
  const [singlePrice, setSinglePrice] = useState<string>(product?.price !== null && product?.price !== undefined ? String(product.price) : "");
  const [variants, setVariants] = useState<Variant[]>(
    product?.variants || [
      { id: "pack-100", pieces: "100", price: 1500 },
      { id: "pack-500", pieces: "500", price: 6500 },
    ]
  );
  const [isNew, setIsNew] = useState(product?.tags?.includes("new") ?? true);
  const [isPopular, setIsPopular] = useState(product?.tags?.includes("popular") ?? false);
  const [available, setAvailable] = useState<number>(product?.available ?? 50);
  const [lowStockAt, setLowStockAt] = useState<number>(product?.lowStockAt ?? 10);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleNameChange(val: string) {
    setName(val);
    if (!isEdit && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const res = await uploadClientImage(file);
      setImage(res.secureUrl);
      notify("success", "Photo uploaded to Cloudinary.");
    } catch (err) {
      notify("error", (err as Error).message || "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  function handleAddVariant() {
    const nextPieces = "1000";
    setVariants((prev) => [
      ...prev,
      { id: `${slug || "pack"}-${nextPieces}-${Date.now().toString(36)}`, pieces: nextPieces, price: null },
    ]);
  }

  function handleVariantChange(index: number, field: "pieces" | "price", val: string) {
    setVariants((prev) => {
      const copy = [...prev];
      if (field === "pieces") {
        copy[index] = { ...copy[index], pieces: val };
      } else {
        const num = val.trim() === "" ? null : Number(val);
        copy[index] = { ...copy[index], price: isNaN(num as number) ? null : num };
      }
      return copy;
    });
  }

  function handleRemoveVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      notify("error", "Please provide a product name.");
      return;
    }
    const cleanSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const tags: ("new" | "popular")[] = [];
    if (isNew) tags.push("new");
    if (isPopular) tags.push("popular");

    const payload: Product = {
      slug: cleanSlug,
      name: name.trim(),
      category,
      kind,
      summary: summary.trim(),
      image: image.trim() || undefined,
      capacityMl: capacityMl ? Number(capacityMl) : undefined,
      price: isVariantProduct ? null : singlePrice.trim() !== "" ? Number(singlePrice) : null,
      variants: isVariantProduct ? variants : undefined,
      tags,
      specs: product?.specs || [
        ["Material", "Food-grade polymer"],
        ["Origin", "Made in Bangladesh"],
      ],
      available,
      lowStockAt,
    };

    try {
      setSaving(true);
      await onSave(payload);
    } catch (err) {
      notify("error", (err as Error).message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.drawerRoot} role="dialog" aria-modal="true" aria-labelledby="product-drawer-title">
      <button type="button" className={styles.navScrim} onClick={onClose} aria-label="Close drawer" />
      <div className={styles.drawer} style={{ maxWidth: 540 }}>
        <div className={styles.drawerHead}>
          <h2 id="product-drawer-title" className={styles.drawerTitle}>
            {isEdit ? `Edit "${product?.name}"` : "Add New Product"}
          </h2>
          <button type="button" className={styles.bannerClose} onClick={onClose} aria-label="Close">
            <Icon name="close" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.drawerBody} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Name & Slug */}
            <div>
              <label className="lbl">Product Name *</label>
              <input
                className="field"
                type="text"
                required
                placeholder="e.g. 500 ml Crystal Clear Box"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            <div>
              <label className="lbl">URL Slug *</label>
              <input
                className="field"
                type="text"
                required
                disabled={isEdit}
                placeholder="e.g. 500-ml-crystal-clear-box"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <span style={{ fontSize: 11, color: "var(--ink-500)" }}>
                Storefront URL will be <code>/product/{slug || "slug"}</code>
              </span>
            </div>

            {/* Category & Shape */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="lbl">Category</label>
                <select
                  className="field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryId)}
                >
                  <option value="square">Square & Rectangular</option>
                  <option value="round">Round Containers</option>
                  <option value="dessert-cups">Dessert Cups</option>
                  <option value="crates">Crates & Bulk</option>
                </select>
              </div>

              <div>
                <label className="lbl">Isometric Shape</label>
                <select
                  className="field"
                  value={kind}
                  onChange={(e) => setKind(e.target.value as ShapeKind)}
                >
                  <option value="square">Square</option>
                  <option value="round">Round</option>
                  <option value="cup">Cup</option>
                  <option value="heart">Heart</option>
                  <option value="crate">Crate</option>
                  <option value="rectClear">Rect Clear</option>
                  <option value="rectBlack">Rect Black Base</option>
                </select>
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="lbl">Short Summary / Description</label>
              <textarea
                className="field"
                rows={2}
                placeholder="Brief description displayed on cards and product pages…"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>

            {/* Media Upload */}
            <div>
              <label className="lbl">Product Photography (Cloudinary)</label>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 4 }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 10,
                    background: "#f4f7f4",
                    border: "1px dashed #cbd5cb",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={buildCloudinaryUrl(image, { width: 144, height: 144, crop: "fill" })}
                      alt="Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ fontSize: 24 }}>📷</span>
                  )}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <label className={`${styles.btnSm} ${styles.btnPrimary}`} style={{ cursor: "pointer", width: "fit-content" }}>
                    {uploadingImage ? "Uploading to Cloudinary…" : "Upload Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                  {image && (
                    <button
                      type="button"
                      className={styles.btnSm}
                      style={{ width: "fit-content", color: "#b91c1c" }}
                      onClick={() => setImage("")}
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Options */}
            <div style={{ padding: "12px 14px", background: "#f8faf8", borderRadius: 10, border: "1px solid #e2e8e2" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600, fontSize: 13.5 }}>
                <input
                  type="checkbox"
                  checked={isVariantProduct}
                  onChange={(e) => setIsVariantProduct(e.target.checked)}
                />
                Sold in pack sizes / quantity tiers (e.g. 100 pcs, 500 pcs)
              </label>

              {!isVariantProduct ? (
                <div style={{ marginTop: 10 }}>
                  <label className="lbl">Single Unit Price (BDT ৳)</label>
                  <input
                    className="field"
                    type="number"
                    step="1"
                    placeholder="Leave empty for 'Price on request'"
                    value={singlePrice}
                    onChange={(e) => setSinglePrice(e.target.value)}
                  />
                </div>
              ) : (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-700)" }}>Pack Variant Tiers</span>
                  {variants.map((v, i) => (
                    <div key={v.id || i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "center" }}>
                      <input
                        className="field"
                        type="text"
                        placeholder="Pieces (e.g. 100)"
                        value={v.pieces}
                        onChange={(e) => handleVariantChange(i, "pieces", e.target.value)}
                      />
                      <input
                        className="field"
                        type="number"
                        placeholder="Price ৳ (or empty)"
                        value={v.price === null ? "" : v.price}
                        onChange={(e) => handleVariantChange(i, "price", e.target.value)}
                      />
                      <button
                        type="button"
                        className={styles.btnSm}
                        onClick={() => handleRemoveVariant(i)}
                        title="Delete tier"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.btnSm}
                    onClick={handleAddVariant}
                    style={{ alignSelf: "flex-start", marginTop: 4 }}
                  >
                    + Add Pack Tier
                  </button>
                </div>
              )}
            </div>

            {/* Inventory Stock Levels */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="lbl">Stock Available (pcs)</label>
                <input
                  className="field"
                  type="number"
                  min="0"
                  value={available}
                  onChange={(e) => setAvailable(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="lbl">Low Stock Alert Level</label>
                <input
                  className="field"
                  type="number"
                  min="0"
                  value={lowStockAt}
                  onChange={(e) => setLowStockAt(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Badges / Tags */}
            <div style={{ display: "flex", gap: 18, marginTop: 4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                />
                Mark as &quot;New Arrival&quot;
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                />
                Mark as &quot;Popular Product&quot;
              </label>
            </div>
          </div>

          <div className={styles.drawerFoot}>
            <button type="button" className={styles.btn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
              {saving ? "Saving to Firestore…" : isEdit ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
