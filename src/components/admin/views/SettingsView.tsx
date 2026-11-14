"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_CONTACT, normalizeContact, PLACEHOLDER, type StoreContact } from "@/lib/contact";
import { Icon, PageHeader, Panel } from "../ui";
import styles from "../admin.module.css";

interface SettingsViewProps {
  contact: StoreContact;
  loading: boolean;
  needsRules?: boolean;
  onSave: (next: StoreContact) => Promise<void>;
  notify: (tone: "success" | "error", text: string) => void;
}

export function SettingsView({ contact, loading, needsRules, onSave, notify }: SettingsViewProps) {
  const [phone, setPhone] = useState(contact.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(contact.whatsapp ?? "");
  const [email, setEmail] = useState(contact.email ?? "");
  const [address, setAddress] = useState(contact.address ?? "");
  const [addressBn, setAddressBn] = useState(contact.addressBn ?? "");
  const [instagramHandle, setInstagramHandle] = useState(contact.instagramHandle);
  const [instagram, setInstagram] = useState(contact.instagram);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPhone(contact.phone ?? "");
    setWhatsapp(contact.whatsapp ?? "");
    setEmail(contact.email ?? "");
    setAddress(contact.address ?? "");
    setAddressBn(contact.addressBn ?? "");
    setInstagramHandle(contact.instagramHandle);
    setInstagram(contact.instagram);
  }, [contact]);

  const draft = useMemo<StoreContact>(
    () =>
      normalizeContact({
        phone,
        whatsapp,
        email,
        address,
        addressBn,
        instagram,
        instagramHandle,
      }),
    [phone, whatsapp, email, address, addressBn, instagram, instagramHandle]
  );

  const isDirty = useMemo(
    () =>
      draft.phone !== contact.phone ||
      draft.whatsapp !== contact.whatsapp ||
      draft.email !== contact.email ||
      draft.address !== contact.address ||
      draft.addressBn !== contact.addressBn ||
      draft.instagram !== contact.instagram ||
      draft.instagramHandle !== contact.instagramHandle,
    [draft, contact]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      await onSave(draft);
    } catch (err) {
      const msg = (err as Error)?.message || "Check permissions and try again.";
      notify("error", `Failed to save settings: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setPhone(contact.phone ?? "");
    setWhatsapp(contact.whatsapp ?? "");
    setEmail(contact.email ?? "");
    setAddress(contact.address ?? "");
    setAddressBn(contact.addressBn ?? "");
    setInstagramHandle(contact.instagramHandle);
    setInstagram(contact.instagram);
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Store & contact settings"
        description="Update business contact details displayed across the footer, Contact page, and WhatsApp order support."
        actions={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/contact" target="_blank" className={styles.btn}>
              View contact page <Icon name="external" size={14} />
            </Link>
            <button
              type="submit"
              form="store-settings-form"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={saving || loading || !isDirty}
            >
              <Icon name="check" size={15} />
              {saving ? "Saving…" : isDirty ? "Save & Publish" : "Saved"}
            </button>
          </div>
        }
      />

      {needsRules && (
        <div className={styles.permissionNotice} role="status">
          <div className={styles.permissionNoticeHead}>
            <div className={styles.permissionNoticeTitle}>
              <Icon name="alert" size={18} />
              <span>Publish Updated Firestore Rules for Store Settings</span>
            </div>
          </div>
          <div className={styles.permissionNoticeBody}>
            <p>
              To store and publish contact info via Firestore (<code>settings/contact</code>), make sure your{" "}
              <code>firestore.rules</code> includes the <code>match /settings/{"{settingId}"}</code> rule in Firebase Console.
            </p>
          </div>
          <div className={styles.permissionNoticeActions}>
            <a
              href="https://console.firebase.google.com/project/onetime-product/firestore/rules"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btnSm} ${styles.btnPrimary}`}
            >
              Open Firebase Rules <Icon name="external" size={14} />
            </a>
          </div>
        </div>
      )}

      <form id="store-settings-form" onSubmit={handleSubmit}>
        <div className={styles.editorGrid}>
          <div className={styles.editorColMain}>
            <Panel
              title="Public Contact Details"
              description="Leave any field blank to show the bracketed placeholder on the storefront."
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  <div>
                    <label className="lbl" htmlFor="st-phone">
                      Phone Number
                    </label>
                    <input
                      id="st-phone"
                      className="field"
                      type="tel"
                      placeholder="+880 1XXX-XXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <label className="lbl" htmlFor="st-whatsapp" style={{ marginBottom: 6 }}>
                        WhatsApp Number
                      </label>
                      {phone.trim() && whatsapp.trim() !== phone.trim() && (
                        <button
                          type="button"
                          onClick={() => setWhatsapp(phone.trim())}
                          style={{
                            border: 0,
                            background: "none",
                            padding: 0,
                            marginBottom: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--brand-700)",
                            cursor: "pointer",
                          }}
                        >
                          Use phone
                        </button>
                      )}
                    </div>
                    <input
                      id="st-whatsapp"
                      className="field"
                      type="tel"
                      placeholder="+880 1XXX-XXXXXX"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="lbl" htmlFor="st-email">
                    Business Email Address
                  </label>
                  <input
                    id="st-email"
                    className="field"
                    type="email"
                    placeholder="orders@onetimeproductbd.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="lbl" htmlFor="st-address">
                    Showroom / Factory Address (English)
                  </label>
                  <textarea
                    id="st-address"
                    className="field"
                    rows={3}
                    placeholder="e.g. 42 Chawkbazar Circular Road, Dhaka 1211"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div>
                  <label className="lbl" htmlFor="st-address-bn">
                    Showroom / Factory Address (Bangla — optional)
                  </label>
                  <textarea
                    id="st-address-bn"
                    className="field"
                    rows={2}
                    placeholder="যেমন: ৪২ চকবাজার সার্কুলার রোড, ঢাকা ১২১১"
                    value={addressBn}
                    onChange={(e) => setAddressBn(e.target.value)}
                  />
                  <p className={styles.sub} style={{ marginTop: 6 }}>
                    Displayed automatically when visitors switch the storefront language to বাংলা.
                  </p>
                </div>
              </div>
            </Panel>

            <Panel title="Social Profile" description="Used in the footer follow callout and Contact page.">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                <div>
                  <label className="lbl" htmlFor="st-ig-handle">
                    Instagram Handle
                  </label>
                  <input
                    id="st-ig-handle"
                    className="field"
                    type="text"
                    placeholder={DEFAULT_CONTACT.instagramHandle}
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="lbl" htmlFor="st-ig-url">
                    Instagram URL
                  </label>
                  <input
                    id="st-ig-url"
                    className="field"
                    type="url"
                    placeholder={DEFAULT_CONTACT.instagram}
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>
              </div>
            </Panel>
          </div>

          <div className={styles.editorColSide}>
            <Panel title="Live Footer Preview" description="Preview updates immediately as you edit.">
              <div
                style={{
                  background: "var(--brand-950)",
                  color: "#fff",
                  borderRadius: 16,
                  padding: "20px 22px",
                  display: "grid",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--accent-500)",
                  }}
                >
                  CONTACT
                </span>
                <div style={{ display: "grid", gap: 8, fontSize: 14, color: "var(--brand-100)" }}>
                  <span style={{ opacity: draft.phone ? 1 : 0.72 }}>
                    {draft.phone ?? PLACEHOLDER.phone}
                  </span>
                  <span style={{ opacity: draft.email ? 1 : 0.72 }}>
                    {draft.email ?? PLACEHOLDER.email}
                  </span>
                  <span style={{ opacity: draft.address ? 1 : 0.72, whiteSpace: "pre-line" }}>
                    {draft.address ?? PLACEHOLDER.address}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 6,
                    paddingTop: 10,
                    borderTop: "1px solid rgba(231, 241, 235, 0.14)",
                    fontSize: 13,
                    color: "var(--brand-100)",
                  }}
                >
                  Instagram:{" "}
                  <strong style={{ color: "var(--accent-500)" }}>
                    {draft.instagramHandle}
                  </strong>
                </div>
              </div>
            </Panel>

            <Panel title="Where updates appear" description="Synced in real time via Firestore.">
              <ul className={styles.contactList}>
                <li>Site Footer — Phone, Email, Address & Instagram link</li>
                <li>Contact Page — Clickable Call, WhatsApp & Email links</li>
                <li>Order Tracking — Customer WhatsApp support button</li>
              </ul>

              {isDirty && (
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button type="button" className={styles.btn} onClick={handleReset} disabled={saving}>
                    Discard changes
                  </button>
                  <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
                    {saving ? "Saving…" : "Save & Publish"}
                  </button>
                </div>
              )}
            </Panel>
          </div>
        </div>
      </form>
    </div>
  );
}
