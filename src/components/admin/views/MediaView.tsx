"use client";

import { useRef, useState } from "react";
import { uploadClientImage } from "@/lib/cloudinary/client";
import { EmptyState, Icon, PageHeader, Panel } from "../ui";
import styles from "../admin.module.css";

interface Asset {
  url: string;
  publicId: string;
  name: string;
}

export function MediaView({ notify }: { notify: (tone: "success" | "error", text: string) => void }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [busy, setBusy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | File[]) {
    const images = [...files].filter((f) => f.type.startsWith("image/"));
    if (!images.length) {
      notify("error", "Choose image files (JPG, PNG or WebP).");
      return;
    }
    for (const file of images) {
      setBusy((n) => n + 1);
      try {
        const res = await uploadClientImage(file);
        setAssets((prev) => [{ url: res.secureUrl, publicId: res.publicId, name: file.name }, ...prev]);
      } catch (err) {
        notify("error", `${file.name}: ${(err as Error).message}`);
      } finally {
        setBusy((n) => n - 1);
      }
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      notify("error", "Couldn’t copy — select the link and copy it manually.");
    }
  }

  return (
    <div className={styles.stack}>
      <PageHeader title="Media" description="Upload product photography and banners to Cloudinary." />

      <Panel>
        <div
          className={`${styles.dropzone} ${dragging ? styles.dropzoneOn : ""}`}
          onDragOver={(e) => (e.preventDefault(), setDragging(true))}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            upload(e.dataTransfer.files);
          }}
        >
          <span className={styles.emptyIcon}>
            <Icon name="upload" size={22} />
          </span>
          <p className={styles.emptyTitle}>{busy > 0 ? `Uploading ${busy} ${busy === 1 ? "file" : "files"}…` : "Drop images here"}</p>
          <p className={styles.emptyText}>or choose files from your computer</p>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => inputRef.current?.click()} disabled={busy > 0}>
            Choose images
          </button>
          <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
        </div>
      </Panel>

      <Panel title="This session" description="Files uploaded since you opened the dashboard">
        {assets.length === 0 ? (
          <EmptyState icon="image" title="No uploads yet" text="Uploaded images appear here with a link you can copy." />
        ) : (
          <ul className={styles.assetGrid}>
            {assets.map((a) => (
              <li key={a.publicId} className={styles.asset}>
                <div className={styles.assetImg}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.url} alt={a.name} loading="lazy" />
                </div>
                <div className={styles.assetBody}>
                  <p className={styles.cellStrong} title={a.name}>
                    {a.name}
                  </p>
                  <button type="button" className={styles.btnSm} onClick={() => copy(a.url)}>
                    <Icon name={copied === a.url ? "check" : "copy"} size={14} />
                    {copied === a.url ? "Copied" : "Copy link"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
