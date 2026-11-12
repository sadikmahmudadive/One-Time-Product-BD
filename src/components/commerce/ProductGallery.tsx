"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ProductShape } from "@/components/ui/ProductShape";
import { buildCloudinaryUrl } from "@/lib/cloudinary/client";
import type { ShapeKind } from "@/lib/content";
import styles from "./ProductGallery.module.css";

interface ProductGalleryProps {
  name: string;
  kind: ShapeKind;
  images: string[];
  categoryId: string;
  categoryShort: string;
  isNew?: boolean;
}

export function ProductGallery({
  name,
  kind,
  images,
  categoryId,
  categoryShort,
  isNew,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Keep index within bounds if images change
  useEffect(() => {
    if (activeIndex >= images.length && images.length > 0) {
      setActiveIndex(0);
    }
  }, [images, activeIndex]);

  const hasPhotos = images.length > 0;
  const hasMultiple = images.length > 1;
  const currentImage = hasPhotos ? images[activeIndex] : null;

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!hasMultiple) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    },
    [hasMultiple, handlePrev, handleNext]
  );

  return (
    <div className={styles.gallery} tabIndex={0} onKeyDown={handleKeyDown}>
      <div className={styles.stage}>
        {/* Floating tags */}
        <div className={styles.tags}>
          {isNew && <span className={styles.tagNew}>New</span>}
          <Link href={`/shop/${categoryId}`} className={styles.tagCat}>
            {categoryShort}
          </Link>
        </div>

        {/* Counter Badge */}
        {hasMultiple && (
          <div className={styles.counterBadge} aria-live="polite">
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* Main Viewport */}
        <div className={styles.shape}>
          {currentImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={currentImage}
              src={buildCloudinaryUrl(currentImage, { width: 900, height: 900, crop: "fill" })}
              alt={`${name} — view ${activeIndex + 1}`}
              className={styles.mainImg}
            />
          ) : (
            <ProductShape kind={kind} />
          )}
        </div>

        {/* Navigation Arrows */}
        {hasMultiple && (
          <>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.prevBtn}`}
              onClick={handlePrev}
              aria-label="Previous photograph"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.nextBtn}`}
              onClick={handleNext}
              aria-label="Next photograph"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* Caption */}
        <p className={styles.caption}>
          {hasPhotos
            ? hasMultiple
              ? `Product photography (${activeIndex + 1} of ${images.length})`
              : "Product photography."
            : "Illustration — product photography to follow."}
        </p>
      </div>

      {/* Thumbnails Strip */}
      {hasMultiple && (
        <div className={styles.thumbnailsWrap} aria-label="Product thumbnails">
          <div className={styles.thumbnails}>
            {images.map((img, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  className={`${styles.thumbBtn} ${isSelected ? styles.thumbActive : ""}`}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`View photo ${idx + 1}`}
                  aria-current={isSelected ? "true" : undefined}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={buildCloudinaryUrl(img, { width: 160, height: 160, crop: "fill" })}
                    alt=""
                    className={styles.thumbImg}
                  />
                  {idx === 0 && <span className={styles.thumbCoverTag}>Cover</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

