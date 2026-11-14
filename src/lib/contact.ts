/**
 * Business contact details.
 * Stored dynamically in Firestore (`settings/contact`) and editable from /admin (#settings),
 * falling back to empty strings / bracketed placeholders until filled in by the business.
 */
export interface StoreContact {
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  addressBn: string | null;
  instagram: string;
  instagramHandle: string;
}

export const DEFAULT_CONTACT: StoreContact = {
  phone: null,
  whatsapp: null,
  email: null,
  address: null,
  addressBn: null,
  instagram: "https://www.instagram.com/_otpb_/",
  instagramHandle: "@_otpb_",
};

/** Backwards-compatible static snapshot; runtime components read live values via useContact(). */
export const CONTACT = {
  phone: DEFAULT_CONTACT.phone,
  whatsapp: DEFAULT_CONTACT.whatsapp,
  email: DEFAULT_CONTACT.email,
  address: DEFAULT_CONTACT.address,
  instagram: DEFAULT_CONTACT.instagram,
};

export const PLACEHOLDER = {
  phone: "[PHONE NUMBER]",
  whatsapp: "[WHATSAPP NUMBER]",
  email: "[EMAIL ADDRESS]",
  address: "[SHOWROOM / FACTORY ADDRESS]",
};

function cleanNullable(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeContact(raw?: Partial<StoreContact> | null): StoreContact {
  const instaUrl =
    typeof raw?.instagram === "string" && raw.instagram.trim()
      ? raw.instagram.trim()
      : DEFAULT_CONTACT.instagram;
  const instaHandle =
    typeof raw?.instagramHandle === "string" && raw.instagramHandle.trim()
      ? raw.instagramHandle.trim()
      : DEFAULT_CONTACT.instagramHandle;

  return {
    phone: cleanNullable(raw?.phone),
    whatsapp: cleanNullable(raw?.whatsapp),
    email: cleanNullable(raw?.email),
    address: cleanNullable(raw?.address),
    addressBn: cleanNullable(raw?.addressBn),
    instagram: instaUrl,
    instagramHandle: instaHandle,
  };
}
