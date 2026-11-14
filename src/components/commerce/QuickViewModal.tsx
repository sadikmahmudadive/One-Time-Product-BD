"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductShape } from "@/components/ui/ProductShape";
import { hasVariants, priceLabel, type Product } from "@/lib/catalog";
import { buildCloudinaryUrl } from "@/lib/cloudinary/client";
import { formatPrice } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/context";
import { QuantityStepper } from "./QuantityStepper";
import styles from "./QuickViewModal.module.css";

export function QuickViewModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { t, pick } = useLanguage();
  const [imgIdx, setImgIdx] = useState(0);
  const [variantId, setVariantId] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setImgIdx(0);
    setQty(1);
    setVariantId(product && hasVariants(product) ? product.variants[0]?.id : undefined);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, onClose]);

  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : [];
  const activeImg = images[imgIdx];
  const variants = hasVariants(product) ? product.variants : null;
  const chosenVariant = variants?.find((v) => v.id === variantId);
  const unitPrice = chosenVariant ? chosenVariant.price : product.price;

  return (
    <div
      className={styles.scrim}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-label={product.name}>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t.nav.closeMenu}>
          ×
        </button>

        <div className={styles.grid}>
          <div className={styles.gallery}>
            <div className={styles.mainImg}>
              {activeImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={buildCloudinaryUrl(activeImg, { width: 520, height: 420, crop: "fit" })} alt={product.name} />
              ) : (
                <ProductShape kind={product.kind} />
              )}
            </div>
            {images.length > 1 && (
              <div className={styles.thumbs}>
                {images.map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    type="button"
                    className={`${styles.thumbBtn} ${idx === imgIdx ? styles.thumbBtnActive : ""}`}
                    onClick={() => setImgIdx(idx)}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={buildCloudinaryUrl(src, { width: 108, height: 108, crop: "fill" })} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.info}>
            <h2 className={styles.title}>{product.name}</h2>
            <p className={styles.price}>
              {unitPrice !== null ? formatPrice(unitPrice) : variants ? priceLabel(product) : t.common.priceOnRequest}
            </p>
            <p className={styles.summary}>{product.summary}</p>

            {product.specs.length > 0 && (
              <div className={styles.specsRow}>
                {product.specs.slice(0, 4).map(([label, value]) => (
                  <span key={label} className={styles.specChip}>
                    {label}: {value}
                  </span>
                ))}
              </div>
            )}

            {variants && (
              <div>
                <p className="lbl" style={{ marginBottom: 6 }}>
                  {t.product.packSizeLegend}
                </p>
                <div className={styles.packs}>
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className={`${styles.packBtn} ${v.id === variantId ? styles.packBtnActive : ""}`}
                      onClick={() => setVariantId(v.id)}
                    >
                      <span>{v.pieces}</span>
                      <span className={styles.packSub}>
                        {v.price !== null ? formatPrice(v.price) : pick("On request", "আলোচনা সাপেক্ষে")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.buyRow}>
              <QuantityStepper value={qty} onChange={setQty} label={product.name} />
              {unitPrice !== null ? (
                <AddToCartButton slug={product.slug} variantId={chosenVariant?.id} qty={qty} className="btn btn-primary" />
              ) : (
                <Link
                  href={`/quote?product=${product.slug}${chosenVariant ? `&pack=${chosenVariant.pieces}` : ""}`}
                  className="btn btn-primary"
                  onClick={onClose}
                >
                  {t.product.askForPrice}
                </Link>
              )}
            </div>

            <Link href={`/product/${product.slug}`} className={styles.detailsLink} onClick={onClose}>
              {pick("View full specifications & details →", "সম্পূর্ণ বিবরণ ও স্পেসিফিকেশন দেখুন →")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
