"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, priceLabel, lowestPrice, type CategoryId, type Product, type Variant } from "@/lib/catalog";
import type { ShapeKind } from "@/lib/content";
import { buildCloudinaryUrl, uploadClientImage } from "@/lib/cloudinary/client";
import { ProductShape } from "@/components/ui/ProductShape";
import { ProductCard } from "@/components/commerce/ProductCard";
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
  const [activeEditor, setActiveEditor] = useState<"new" | Product | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Scroll to top whenever entering or exiting the full-screen editor
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeEditor]);

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
      // onSeed in AdminDashboard notifies with exact error
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

  // If editor is launched, render the Full-Screen Editor Workspace
  if (activeEditor !== null) {
    return (
      <ProductEditorPage
        product={activeEditor === "new" ? null : activeEditor}
        onBack={() => setActiveEditor(null)}
        onSave={async (saved) => {
          await onSave(saved);
          setActiveEditor(null);
        }}
        notify={notify}
      />
    );
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
              onClick={() => setActiveEditor("new")}
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
                            onClick={() => setActiveEditor(p)}
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
    </div>
  );
}

/* ==============================================================================
   FULL-SCREEN PRODUCT EDITOR PAGE
   ============================================================================== */

interface ProductEditorPageProps {
  product: Product | null;
  onBack: () => void;
  onSave: (product: Product) => Promise<void>;
  notify: (tone: "success" | "error", text: string) => void;
}

function ProductEditorPage({ product, onBack, onSave, notify }: ProductEditorPageProps) {
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
  const [specs, setSpecs] = useState<[string, string][]>(
    product?.specs || [
      ["Material", "Crystal Acrylic"],
      ["Food Grade", "Yes (FDA Compliant)"],
      ["Pack sizes", "Retail & Wholesale cartons"],
      ["Origin", "Made in Bangladesh"],
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
    if (!isEdit) {
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
      notify("success", "Photo uploaded directly to Cloudinary.");
    } catch (err) {
      notify("error", (err as Error).message || "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  function handleAddVariant() {
    const pieces = "1000";
    setVariants((prev) => [
      ...prev,
      { id: `${slug || "pack"}-${pieces}-${Date.now().toString(36)}`, pieces, price: null },
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

  function handleSpecChange(index: number, field: "label" | "value", val: string) {
    setSpecs((prev) => {
      const copy = [...prev] as [string, string][];
      if (field === "label") copy[index] = [val, copy[index][1]];
      else copy[index] = [copy[index][0], val];
      return copy;
    });
  }

  function handleAddSpec() {
    setSpecs((prev) => [...prev, ["", ""]]);
  }

  function handleRemoveSpec(index: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      notify("error", "Please provide a product title.");
      return;
    }
    const cleanSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const tags: ("new" | "popular")[] = [];
    if (isNew) tags.push("new");
    if (isPopular) tags.push("popular");

    const validSpecs = specs.filter(([k, v]) => k.trim() !== "" || v.trim() !== "");

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
      specs: validSpecs,
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

  // Real-time calculated price string for preview
  const previewPrice = useMemo(() => {
    if (isVariantProduct) {
      const prices = variants.map((v) => v.price).filter((p): p is number => p !== null);
      if (!prices.length) return "Price on request";
      return prices.length > 1
        ? `${formatPrice(Math.min(...prices))} – ${formatPrice(Math.max(...prices))}`
        : `From ${formatPrice(prices[0])}`;
    }
    return singlePrice.trim() !== "" ? formatPrice(Number(singlePrice)) : "Price on request";
  }, [isVariantProduct, variants, singlePrice]);

  return (
    <div className={styles.editorWorkspace}>
      {/* Top Header */}
      <header className={styles.editorHeader}>
        <div className={styles.editorTitleGroup}>
          <button type="button" className={styles.editorBackBtn} onClick={onBack}>
            <Icon name="chevron" size={14} /> Back to Products
          </button>
          <h1 className={styles.editorTitle}>
            {isEdit ? `Edit Product: ${product?.name}` : "Create New Product"}
          </h1>
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              background: isEdit ? "#e0f2fe" : "#ecfdf5",
              color: isEdit ? "#0369a1" : "#047857",
            }}
          >
            {isEdit ? "Published Catalogue Item" : "New Item"}
          </span>
        </div>

        <div className={styles.editorHeaderActions}>
          <button type="button" className={styles.btn} onClick={onBack} disabled={saving}>
            Cancel
          </button>
          {isEdit && product && (
            <Link
              href={`/product/${product.slug}`}
              target="_blank"
              className={styles.btn}
              title="Open storefront product page"
            >
              View on Store <Icon name="external" size={14} />
            </Link>
          )}
          <button
            type="submit"
            form="product-editor-form"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={saving}
          >
            {saving ? "Saving to Firestore…" : isEdit ? "Save Changes" : "Publish Product"}
          </button>
        </div>
      </header>

      {/* Main 2-Column Grid */}
      <form id="product-editor-form" onSubmit={handleSubmit}>
        <div className={styles.editorGrid}>
          {/* Left Column (Primary Details) */}
          <div className={styles.editorColMain}>
            {/* 1. Title, Slug & Description */}
            <Panel title="Product Information" description="Primary details visible across the storefront.">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="lbl">Product Name / Title *</label>
                  <input
                    className="field"
                    type="text"
                    required
                    placeholder="e.g. 500 ml Transparent Square Box"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>

                <div>
                  <label className="lbl">URL Handle / Slug *</label>
                  <input
                    className="field"
                    type="text"
                    required
                    disabled={isEdit}
                    placeholder="e.g. 500-ml-transparent-square-box"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                  <div style={{ marginTop: 6, fontSize: 12, color: "var(--ink-500)" }}>
                    Storefront URL: <code style={{ background: "#f0f4f1", padding: "2px 6px", borderRadius: 4 }}>https://onetimeproductbd.com/product/{slug || "slug"}</code>
                  </div>
                </div>

                <div>
                  <label className="lbl">Short Summary / Product Copy</label>
                  <textarea
                    className="field"
                    rows={3}
                    placeholder="Crisp one or two line description shown under the title and in search results…"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </div>
              </div>
            </Panel>

            {/* 2. Cloudinary Media Asset */}
            <Panel title="Media & Photography" description="High-resolution product photographs stored on Cloudinary.">
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: 12,
                    background: "#f8faf8",
                    border: "2px dashed #cbd5cb",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={buildCloudinaryUrl(image, { width: 280, height: 280, crop: "fill" })}
                      alt="Uploaded preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ textAlign: "center", color: "var(--ink-400)", padding: 8 }}>
                      <span style={{ fontSize: 32 }}>☁️</span>
                      <p style={{ margin: "4px 0 0", fontSize: 11 }}>No photo yet</p>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 10 }}>
                  <label className={`${styles.btn} ${styles.btnPrimary}`} style={{ cursor: "pointer", width: "fit-content" }}>
                    <Icon name="upload" size={15} />
                    {uploadingImage ? "Uploading to Cloudinary…" : "Upload Packaging Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>

                  <p style={{ margin: 0, fontSize: 12, color: "var(--ink-500)", lineHeight: 1.5 }}>
                    Accepted formats: PNG, JPG, WebP. Image is automatically compressed and served via Cloudinary global CDN.
                  </p>

                  {image && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                      <button
                        type="button"
                        className={styles.btnSm}
                        onClick={() => {
                          navigator.clipboard.writeText(image);
                          notify("success", "Cloudinary image URL copied.");
                        }}
                      >
                        <Icon name="copy" size={13} /> Copy URL
                      </button>
                      <button
                        type="button"
                        className={`${styles.btnSm} ${styles.btnDanger}`}
                        onClick={() => setImage("")}
                      >
                        Remove Photo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Panel>

            {/* 3. Pricing & Variants */}
            <Panel title="Pricing & Quantity Options" description="Set pricing either as a single price or multi-tier wholesale pack sizes.">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div
                  style={{
                    padding: "14px 18px",
                    background: "#f8faf8",
                    borderRadius: 10,
                    border: "1px solid #e2e8e2",
                  }}
                >
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                    <input
                      type="checkbox"
                      checked={isVariantProduct}
                      onChange={(e) => setIsVariantProduct(e.target.checked)}
                      style={{ width: 18, height: 18 }}
                    />
                    Sold in pack variants / quantity cartons (e.g. 100 pcs, 500 pcs)
                  </label>
                  <p style={{ margin: "4px 0 0 28px", fontSize: 12, color: "var(--ink-500)" }}>
                    Check this if customers choose between different carton or sleeve pack sizes.
                  </p>
                </div>

                {!isVariantProduct ? (
                  <div style={{ maxWidth: 320 }}>
                    <label className="lbl">Single Unit Retail Price (BDT ৳)</label>
                    <input
                      className="field"
                      type="number"
                      step="1"
                      placeholder="e.g. 18 (leave empty for 'Price on request')"
                      value={singlePrice}
                      onChange={(e) => setSinglePrice(e.target.value)}
                    />
                    <span style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 4, display: "block" }}>
                      Leave blank if this item requires custom wholesale quotation.
                    </span>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-800)" }}>
                        Pack Size Tiers ({variants.length})
                      </span>
                      <button
                        type="button"
                        className={styles.btnSm}
                        onClick={handleAddVariant}
                      >
                        + Add Pack Tier
                      </button>
                    </div>

                    <div className={styles.variantTableWrap}>
                      <table className={styles.variantTable}>
                        <thead>
                          <tr>
                            <th>Pack Size / Pieces</th>
                            <th>Price in BDT (৳)</th>
                            <th style={{ width: 44 }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((v, i) => (
                            <tr key={v.id || i}>
                              <td>
                                <input
                                  className="field"
                                  type="text"
                                  placeholder="e.g. 100 pcs or Sleeve (50 pcs)"
                                  value={v.pieces}
                                  onChange={(e) => handleVariantChange(i, "pieces", e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  className="field"
                                  type="number"
                                  placeholder="Price (leave empty for 'On request')"
                                  value={v.price === null ? "" : v.price}
                                  onChange={(e) => handleVariantChange(i, "price", e.target.value)}
                                />
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <button
                                  type="button"
                                  className={styles.bannerClose}
                                  onClick={() => handleRemoveVariant(i)}
                                  title="Delete variant"
                                  disabled={variants.length <= 1}
                                >
                                  <Icon name="close" size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </Panel>

            {/* 4. Technical Specifications */}
            <Panel title="Technical Specifications" description="Material, usage, and dimensions listed on the product detail page.">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {specs.map(([label, val], idx) => (
                  <div key={idx} className={styles.specRow}>
                    <input
                      className="field"
                      type="text"
                      placeholder="Spec label (e.g. Material)"
                      value={label}
                      onChange={(e) => handleSpecChange(idx, "label", e.target.value)}
                    />
                    <input
                      className="field"
                      type="text"
                      placeholder="Value (e.g. Food-grade PET)"
                      value={val}
                      onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.bannerClose}
                      onClick={() => handleRemoveSpec(idx)}
                      title="Remove specification"
                    >
                      <Icon name="close" size={15} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.btnSm}
                  onClick={handleAddSpec}
                  style={{ alignSelf: "flex-start", marginTop: 4 }}
                >
                  + Add Specification
                </button>
              </div>
            </Panel>
          </div>

          {/* Right Column (Sidebar, Categorization, Inventory, & Live Storefront Preview) */}
          <div className={styles.editorColSide}>
            {/* Live Storefront Card Preview */}
            <Panel title="Storefront Live Preview" description="Real-time preview of how this product renders on /shop.">
              <div style={{ background: "#ffffff", padding: "12px 0" }}>
                <ProductCard
                  name={name || "Product Name"}
                  kind={kind}
                  image={image || undefined}
                  href="#"
                  badge={isNew ? "new" : "in-stock"}
                  meta={
                    isVariantProduct
                      ? `Packs of ${variants.map((v) => v.pieces).join(" · ")}`
                      : capacityMl
                      ? `${capacityMl} ml`
                      : undefined
                  }
                  price={previewPrice}
                  unit={isVariantProduct ? "by pack size" : undefined}
                  action={
                    <button type="button" className="btn btn-primary btn-block" disabled>
                      {isVariantProduct ? "Choose options" : "Add to cart"}
                    </button>
                  }
                />
              </div>
            </Panel>

            {/* Categorization & 3D Shape */}
            <Panel title="Classification">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="lbl">Product Category</label>
                  <select
                    className="field"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryId)}
                  >
                    <option value="square">Square & Rectangular Boxes</option>
                    <option value="round">Round Containers</option>
                    <option value="dessert-cups">Dessert Cups</option>
                    <option value="crates">Crates & Bulk Storage</option>
                  </select>
                </div>

                <div>
                  <label className="lbl">3D Isometric Fallback Shape</label>
                  <select
                    className="field"
                    value={kind}
                    onChange={(e) => setKind(e.target.value as ShapeKind)}
                  >
                    <option value="square">Square Box</option>
                    <option value="round">Round Container</option>
                    <option value="cup">Semi-Square Cup</option>
                    <option value="heart">Heart Cup</option>
                    <option value="crate">Plastic Crate</option>
                    <option value="rectClear">Rect Clear (Crystal)</option>
                    <option value="rectBlack">Rect Black Base</option>
                  </select>
                </div>

                <div>
                  <label className="lbl">Capacity in ml (optional)</label>
                  <input
                    className="field"
                    type="number"
                    placeholder="e.g. 500 or 1000"
                    value={capacityMl}
                    onChange={(e) => setCapacityMl(e.target.value)}
                  />
                </div>
              </div>
            </Panel>

            {/* Warehouse Stock Levels */}
            <Panel title="Inventory Control">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="lbl">Available Stock (pcs)</label>
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

                <div style={{ padding: "8px 12px", background: "#f8faf8", borderRadius: 8, fontSize: 12 }}>
                  Health:{" "}
                  {available === 0 ? (
                    <strong style={{ color: "#dc2626" }}>Out of Stock</strong>
                  ) : available <= lowStockAt ? (
                    <strong style={{ color: "#d97706" }}>Low Stock Alert</strong>
                  ) : (
                    <strong style={{ color: "#059669" }}>Healthy Inventory</strong>
                  )}
                </div>
              </div>
            </Panel>

            {/* Badges & Merchandising Tags */}
            <Panel title="Badges & Tags">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                  />
                  Mark as &quot;New Arrival&quot;
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                  />
                  Mark as &quot;Popular Product&quot;
                </label>
              </div>
            </Panel>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className={styles.editorStickyFoot}>
          <div style={{ fontSize: 13, color: "var(--ink-600)" }}>
            {isEdit ? `Editing ${product?.name}` : "Creating new catalogue product"}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className={styles.btn} onClick={onBack} disabled={saving}>
              Discard Changes
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
              {saving ? "Saving to Firestore…" : isEdit ? "Save Changes" : "Publish Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
