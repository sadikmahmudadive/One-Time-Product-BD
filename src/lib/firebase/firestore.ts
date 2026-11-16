import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { PRODUCTS, type Product } from "@/lib/catalog";
import { normalizeContact, type StoreContact } from "@/lib/contact";
import { normalizeCoupon, normalizeCouponCode, type Coupon } from "@/lib/coupons";
import { normalizePromos, type PromoBannerItem } from "@/lib/promos";
import { normalizeMemberEmail, normalizeTeamMember, type TeamMember } from "@/lib/roles";
import { db, isFirebaseConfigured } from "./config";

function requireDb() {
  if (!isFirebaseConfigured || !db) {
    throw new Error(
      "Firestore is not configured. Please supply Firebase credentials in .env.local."
    );
  }
  return db;
}

export interface EnquiryRecord {
  id?: string;
  kind: "quote" | "contact";
  data: Record<string, string>;
  createdAt?: unknown;
  status: "new" | "in_progress" | "completed" | "archived";
}

/** Save an enquiry (bulk quote request or contact message) to Firestore */
export async function saveEnquiryToFirestore(
  kind: "quote" | "contact",
  data: Record<string, string>
): Promise<string> {
  const database = requireDb();
  const docRef = await addDoc(collection(database, "enquiries"), {
    kind,
    data,
    status: "new",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/** Fetch recent enquiries */
export async function getEnquiriesFromFirestore(
  kind?: "quote" | "contact"
): Promise<EnquiryRecord[]> {
  const database = requireDb();
  const col = collection(database, "enquiries");
  try {
    const q = kind
      ? query(col, where("kind", "==", kind), orderBy("createdAt", "desc"))
      : query(col, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<EnquiryRecord, "id">),
    }));
  } catch (err) {
    console.warn("Retrying getEnquiries without orderBy:", err);
    const fallbackQ = kind ? query(col, where("kind", "==", kind)) : col;
    const snapshot = await getDocs(fallbackQ);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<EnquiryRecord, "id">),
    }));
  }
}

/** Update the workflow state of a quote or contact request. */
export async function updateEnquiryStatus(id: string, status: EnquiryRecord["status"]): Promise<void> {
  await updateDoc(doc(requireDb(), "enquiries", id), { status });
}

export interface NewsletterSubscription {
  id?: string;
  email: string;
  createdAt?: unknown;
}

/** Fetch recent newsletter subscribers for the marketing workspace. */
export async function getNewsletterSubscriptions(max = 250): Promise<NewsletterSubscription[]> {
  const database = requireDb();
  try {
    const snapshot = await getDocs(query(collection(database, "subscribers"), orderBy("createdAt", "desc"), limit(max)));
    return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NewsletterSubscription, "id">) }));
  } catch {
    const snapshot = await getDocs(query(collection(database, "subscribers"), limit(max)));
    return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NewsletterSubscription, "id">) }));
  }
}

export interface InventoryRecord {
  slug: string;
  available: number;
  lowStockAt: number;
  imageUrl?: string;
  updatedAt?: unknown;
}

/** Inventory levels are kept separately from catalogue copy and prices. */
export async function getInventoryFromFirestore(): Promise<InventoryRecord[]> {
  const snapshot = await getDocs(collection(requireDb(), "inventory"));
  return snapshot.docs.map((d) => ({ slug: d.id, ...(d.data() as Omit<InventoryRecord, "slug">) }));
}

export async function saveInventoryToFirestore(
  slug: string,
  available: number,
  lowStockAt: number,
  imageUrl?: string
): Promise<void> {
  const data: Record<string, unknown> = {
    available,
    lowStockAt,
    updatedAt: serverTimestamp(),
  };
  if (imageUrl !== undefined) {
    data.imageUrl = imageUrl;
  }
  await setDoc(doc(requireDb(), "inventory", slug), data, { merge: true });
}

/** Serializes a product for Cloud Firestore (converts nested array specs to objects, strips undefined). */
function serializeProductForFirestore(p: Product): Record<string, unknown> {
  const images = Array.isArray(p.images)
    ? p.images.map((s) => String(s).trim()).filter(Boolean)
    : p.image
    ? [String(p.image).trim()]
    : [];
  const primaryImage = p.image?.trim() || images[0] || null;

  const data: Record<string, unknown> = {
    slug: p.slug,
    name: p.name,
    category: p.category,
    kind: p.kind,
    summary: p.summary || "",
    price: p.price ?? null,
    tags: p.tags || [],
    specs: (p.specs || []).map((s) => (Array.isArray(s) ? { label: s[0], value: s[1] } : s)),
    updatedAt: serverTimestamp(),
  };

  if (primaryImage) data.image = primaryImage;
  if (images.length > 0) data.images = images;
  if (p.capacityMl !== undefined && p.capacityMl !== null) data.capacityMl = p.capacityMl;
  data.variants =
    p.variants && p.variants.length > 0
      ? p.variants.map((v) => ({
          id: v.id,
          pieces: v.pieces,
          price: v.price ?? null,
        }))
      : [];
  if (p.available !== undefined && p.available !== null) data.available = p.available;
  if (p.lowStockAt !== undefined && p.lowStockAt !== null) data.lowStockAt = p.lowStockAt;

  return data;
}

/** Deserializes a product document from Cloud Firestore. */
function deserializeProductFromFirestore(docId: string, data: Record<string, unknown>): Product {
  const specsRaw = data.specs as ({ label: string; value: string } | [string, string])[] | undefined;
  const specs: [string, string][] = (specsRaw || []).map((s) => {
    if (Array.isArray(s)) return [String(s[0]), String(s[1])];
    if (s && typeof s === "object" && "label" in s && "value" in s) {
      return [String(s.label), String(s.value)];
    }
    return ["", ""];
  });

  const rawImages = Array.isArray(data.images)
    ? (data.images as unknown[])
        .filter((x): x is string => typeof x === "string" && x.trim() !== "")
        .map((x) => x.trim())
    : [];
  const primaryImage = (data.image as string)?.trim() || rawImages[0] || undefined;
  const images = rawImages.length > 0 ? rawImages : primaryImage ? [primaryImage] : [];

  return {
    slug: (data.slug as string) || docId,
    name: (data.name as string) || "",
    category: (data.category as Product["category"]) || "square",
    kind: (data.kind as Product["kind"]) || "square",
    summary: (data.summary as string) || "",
    price: data.price !== undefined ? (data.price as number | null) : null,
    image: primaryImage,
    images: images.length > 0 ? images : undefined,
    capacityMl: data.capacityMl !== undefined && data.capacityMl !== null ? (data.capacityMl as number) : undefined,
    variants: data.variants as Product["variants"],
    tags: (data.tags as ("new" | "popular")[]) || [],
    specs,
    available: data.available !== undefined && data.available !== null ? (data.available as number) : undefined,
    lowStockAt: data.lowStockAt !== undefined && data.lowStockAt !== null ? (data.lowStockAt as number) : undefined,
  };
}

/** Fetch all catalogue products from Firestore, merged with inventory data. */
export async function getProductsFromFirestore(): Promise<Product[]> {
  try {
    const database = requireDb();
    const [productsSnap, inventorySnap] = await Promise.allSettled([
      getDocs(collection(database, "products")),
      getDocs(collection(database, "inventory")),
    ]);

    const inventoryMap = new Map<string, InventoryRecord>();
    if (inventorySnap.status === "fulfilled") {
      inventorySnap.value.docs.forEach((d) => {
        inventoryMap.set(d.id, { slug: d.id, ...(d.data() as Omit<InventoryRecord, "slug">) });
      });
    }

    if (productsSnap.status === "fulfilled" && !productsSnap.value.empty) {
      return productsSnap.value.docs.map((d) => {
        const product = deserializeProductFromFirestore(d.id, d.data());
        const inv = inventoryMap.get(d.id);
        return {
          ...product,
          image: inv?.imageUrl || product.image,
          available: inv?.available ?? product.available,
          lowStockAt: inv?.lowStockAt ?? product.lowStockAt,
        };
      });
    }

    // Fallback: Return base PRODUCTS merged with live inventory
    return PRODUCTS.map((p) => {
      const inv = inventoryMap.get(p.slug);
      return {
        ...p,
        image: inv?.imageUrl || p.image,
        available: inv?.available,
        lowStockAt: inv?.lowStockAt,
      };
    });
  } catch (err) {
    console.warn("Failed to load products from Firestore, using static catalogue:", err);
    return PRODUCTS;
  }
}

/** Retrieve a single product by slug from Firestore. */
export async function getProductFromFirestore(slug: string): Promise<Product | null> {
  try {
    const database = requireDb();
    const [docSnap, invSnap] = await Promise.allSettled([
      getDoc(doc(database, "products", slug)),
      getDoc(doc(database, "inventory", slug)),
    ]);

    let base: Product | null = null;
    if (docSnap.status === "fulfilled" && docSnap.value.exists()) {
      base = deserializeProductFromFirestore(docSnap.value.id, docSnap.value.data());
    } else {
      const staticP = PRODUCTS.find((p) => p.slug === slug);
      if (staticP) base = { ...staticP };
    }

    if (!base) return null;

    if (invSnap.status === "fulfilled" && invSnap.value.exists()) {
      const inv = invSnap.value.data() as InventoryRecord;
      if (inv.imageUrl) base.image = inv.imageUrl;
      if (inv.available !== undefined) base.available = inv.available;
      if (inv.lowStockAt !== undefined) base.lowStockAt = inv.lowStockAt;
    }

    return base;
  } catch (err) {
    console.warn("Failed to get product from Firestore:", err);
    return PRODUCTS.find((p) => p.slug === slug) ?? null;
  }
}

/** Save or update a product document in Firestore. */
export async function saveProductToFirestore(product: Product): Promise<void> {
  const database = requireDb();
  const slug = product.slug.trim().toLowerCase();
  const docRef = doc(database, "products", slug);

  const data = serializeProductForFirestore({ ...product, slug });
  await setDoc(docRef, data, { merge: true });

  const primaryImage = product.image || (product.images && product.images[0]);
  if (product.available !== undefined || product.lowStockAt !== undefined || primaryImage) {
    await saveInventoryToFirestore(
      slug,
      product.available ?? 0,
      product.lowStockAt ?? 10,
      primaryImage
    );
  }
}

/** Delete a product from Firestore. */
export async function deleteProductFromFirestore(slug: string): Promise<void> {
  const database = requireDb();
  await Promise.allSettled([
    deleteDoc(doc(database, "products", slug)),
    deleteDoc(doc(database, "inventory", slug)),
  ]);
}

/** Seed all initial catalogue items into Firestore */
export async function seedCatalogToFirestore(): Promise<number> {
  const database = requireDb();
  let count = 0;
  for (const product of PRODUCTS) {
    const data = serializeProductForFirestore(product);
    await setDoc(doc(database, "products", product.slug), data, { merge: true });
    count++;
  }
  return count;
}

/** Save email subscriber to Firestore */
export async function saveNewsletterSubscription(email: string): Promise<string> {
  const database = requireDb();
  const docRef = await addDoc(collection(database, "subscribers"), {
    email: email.trim().toLowerCase(),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export interface OrderRecord {
  id?: string;
  userId?: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    district: string;
    address?: string;
  };
  items: {
    slug: string;
    name: string;
    variantId?: string;
    variantLabel?: string;
    unitPrice: number | null;
    qty: number;
    subtotal: number | null;
  }[];
  subtotal?: number | null;
  couponCode?: string;
  discountAmount?: number;
  totalPrice: number | null;
  status: "pending" | "confirmed" | "shipped" | "cancelled";
  createdAt?: unknown;
}

/** Save an order to Firestore */
export async function saveOrderToFirestore(order: Omit<OrderRecord, "id" | "createdAt">): Promise<string> {
  const database = requireDb();
  const payload: Record<string, unknown> = {
    customer: {
      name: order.customer.name,
      phone: order.customer.phone,
      district: order.customer.district,
      ...(order.customer.email ? { email: order.customer.email } : {}),
      ...(order.customer.address ? { address: order.customer.address } : {}),
    },
    items: order.items.map((item) => ({
      slug: item.slug,
      name: item.name,
      ...(item.variantId ? { variantId: item.variantId } : {}),
      ...(item.variantLabel ? { variantLabel: item.variantLabel } : {}),
      unitPrice: item.unitPrice ?? null,
      qty: item.qty,
      subtotal: item.subtotal ?? null,
    })),
    totalPrice: order.totalPrice ?? null,
    status: order.status || "pending",
    createdAt: serverTimestamp(),
  };

  if (order.userId) payload.userId = order.userId;
  if (order.subtotal !== undefined) payload.subtotal = order.subtotal;
  if (order.couponCode) payload.couponCode = order.couponCode;
  if (order.discountAmount !== undefined && order.discountAmount > 0) payload.discountAmount = order.discountAmount;

  const docRef = await addDoc(collection(database, "orders"), payload);
  return docRef.id;
}

/** Retrieve an order by document ID */
export async function getOrderFromFirestore(orderId: string): Promise<OrderRecord | null> {
  const cleanId = orderId.trim();
  if (!cleanId) return null;
  const database = requireDb();
  const docSnap = await getDoc(doc(database, "orders", cleanId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...(docSnap.data() as Omit<OrderRecord, "id">) };
}

/** Retrieve all orders belonging to a specific signed-in customer. */
export async function getUserOrdersFromFirestore(userId: string): Promise<OrderRecord[]> {
  if (!userId) return [];
  const database = requireDb();
  const col = collection(database, "orders");
  try {
    const q = query(col, where("userId", "==", userId), orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<OrderRecord, "id">) }));
  } catch (err) {
    console.warn("Retrying getUserOrders without orderBy:", err);
    const fallbackQ = query(col, where("userId", "==", userId), limit(50));
    const snapshot = await getDocs(fallbackQ);
    const list = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<OrderRecord, "id">) }));
    // Sort client-side newest first
    return list.sort((a, b) => {
      const ta = (a.createdAt as { toDate?: () => Date })?.toDate?.()?.getTime() ?? 0;
      const tb = (b.createdAt as { toDate?: () => Date })?.toDate?.()?.getTime() ?? 0;
      return tb - ta;
    });
  }
}

/** Fetch the most recent orders for the operations dashboard. */
export async function getOrdersFromFirestore(max = 100): Promise<OrderRecord[]> {
  const database = requireDb();
  try {
    const snapshot = await getDocs(query(collection(database, "orders"), orderBy("createdAt", "desc"), limit(max)));
    return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<OrderRecord, "id">) }));
  } catch (err) {
    console.warn("Retrying getOrders without orderBy:", err);
    const snapshot = await getDocs(query(collection(database, "orders"), limit(max)));
    return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<OrderRecord, "id">) }));
  }
}

/** Advance an order through the fulfilment workflow. */
export async function updateOrderStatus(id: string, status: OrderRecord["status"]): Promise<void> {
  await updateDoc(doc(requireDb(), "orders", id), { status });
}

/** Read public business contact settings (`settings/contact`) from Firestore. */
export async function getStoreContactFromFirestore(): Promise<StoreContact | null> {
  if (!isFirebaseConfigured || !db) return null;
  const snap = await getDoc(doc(db, "settings", "contact"));
  if (!snap.exists()) return null;
  return normalizeContact(snap.data() as Partial<StoreContact>);
}

/** Subscribe to real-time updates on `settings/contact` so footer & pages reflect edits immediately. */
export function subscribeStoreContact(
  onData: (contact: StoreContact | null) => void,
  onError?: (err: Error) => void
): () => void {
  if (!isFirebaseConfigured || !db) return () => {};
  return onSnapshot(
    doc(db, "settings", "contact"),
    (snap) => {
      onData(snap.exists() ? normalizeContact(snap.data() as Partial<StoreContact>) : null);
    },
    (err) => {
      onError?.(err);
    }
  );
}

/** Save business contact settings from the admin panel to Firestore (`settings/contact`). */
export async function saveStoreContactToFirestore(contact: StoreContact): Promise<StoreContact> {
  const normalized = normalizeContact(contact);
  await setDoc(
    doc(requireDb(), "settings", "contact"),
    {
      ...normalized,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return normalized;
}

/** Look up a single coupon document by uppercase promo code (exact match for customer validation). */
export async function getCouponFromFirestore(code: string): Promise<Coupon | null> {
  const cleanCode = normalizeCouponCode(code);
  if (!cleanCode || !isFirebaseConfigured || !db) return null;
  const snap = await getDoc(doc(db, "coupons", cleanCode));
  if (!snap.exists()) return null;
  const data = snap.data() as Partial<Coupon>;
  return normalizeCoupon({ ...data, code: data.code || snap.id });
}

/** List all promo coupons for the admin operations view. */
export async function getCouponsFromFirestore(): Promise<Coupon[]> {
  const database = requireDb();
  const snapshot = await getDocs(collection(database, "coupons"));
  const list = snapshot.docs.map((d) => {
    const data = d.data() as Partial<Coupon>;
    return normalizeCoupon({ ...data, code: data.code || d.id });
  });
  return list.sort((a, b) => a.code.localeCompare(b.code));
}

/** Create or update a promo coupon in Firestore using its uppercase code as document ID. */
export async function saveCouponToFirestore(coupon: Coupon): Promise<Coupon> {
  const normalized = normalizeCoupon(coupon);
  if (!normalized.code) {
    throw new Error("Coupon code is required.");
  }
  const database = requireDb();
  await setDoc(
    doc(database, "coupons", normalized.code),
    {
      code: normalized.code,
      type: normalized.type,
      value: normalized.value,
      minOrder: normalized.minOrder ?? null,
      maxDiscount: normalized.maxDiscount ?? null,
      expiresAt: normalized.expiresAt ?? null,
      active: normalized.active,
      description: normalized.description || "",
      updatedAt: serverTimestamp(),
      ...(normalized.createdAt ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true }
  );
  return normalized;
}

/** Delete a promo coupon document by code. */
export async function deleteCouponFromFirestore(code: string): Promise<void> {
  const cleanCode = normalizeCouponCode(code);
  if (!cleanCode) return;
  await deleteDoc(doc(requireDb(), "coupons", cleanCode));
}

/** Read top announcement / promo bar offers (`settings/promotions`). */
export async function getPromosFromFirestore(): Promise<PromoBannerItem[]> {
  if (!isFirebaseConfigured || !db) return [];
  const snap = await getDoc(doc(db, "settings", "promotions"));
  if (!snap.exists()) return [];
  return normalizePromos((snap.data() as { items?: unknown }).items);
}

/** Subscribe to real-time updates on `settings/promotions`. */
export function subscribePromos(
  onData: (items: PromoBannerItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!isFirebaseConfigured || !db) return () => {};
  return onSnapshot(
    doc(db, "settings", "promotions"),
    (snap) => {
      const items = snap.exists() ? normalizePromos((snap.data() as { items?: unknown }).items) : [];
      onData(items);
    },
    (err) => {
      onError?.(err);
    }
  );
}

/** Save top announcement / promo bar offers from the admin panel to `settings/promotions`. */
export async function savePromosToFirestore(items: PromoBannerItem[]): Promise<PromoBannerItem[]> {
  const normalized = normalizePromos(items);
  await setDoc(
    doc(requireDb(), "settings", "promotions"),
    {
      items: normalized.map((p) => ({
        id: p.id,
        text: p.text,
        active: p.active,
        ...(p.badge ? { badge: p.badge } : {}),
        ...(p.textBn ? { textBn: p.textBn } : {}),
        ...(p.code ? { code: p.code } : {}),
        ...(p.href ? { href: p.href } : {}),
      })),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return normalized;
}

/** Look up a signed-in user's assigned team role by normalized email (`team_roles/{email}`). */
export async function getMyTeamRoleFromFirestore(email: string): Promise<TeamMember | null> {
  const cleanEmail = normalizeMemberEmail(email);
  if (!cleanEmail || !isFirebaseConfigured || !db) return null;
  try {
    const snap = await getDoc(doc(db, "team_roles", cleanEmail));
    if (!snap.exists()) return null;
    const data = snap.data() as Partial<TeamMember>;
    return normalizeTeamMember({ ...data, email: data.email || snap.id });
  } catch {
    return null;
  }
}

/** Subscribe to real-time updates on the current user's assigned role (`team_roles/{email}`). */
export function subscribeMyTeamRole(
  email: string,
  onData: (member: TeamMember | null) => void,
  onError?: (err: Error) => void
): () => void {
  const cleanEmail = normalizeMemberEmail(email);
  if (!cleanEmail || !isFirebaseConfigured || !db) return () => {};
  return onSnapshot(
    doc(db, "team_roles", cleanEmail),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const data = snap.data() as Partial<TeamMember>;
      onData(normalizeTeamMember({ ...data, email: data.email || snap.id }));
    },
    (err) => {
      onError?.(err);
    }
  );
}

/** Admin only: list all assigned admins & store managers (`team_roles`). */
export async function getTeamRolesFromFirestore(): Promise<TeamMember[]> {
  const database = requireDb();
  const snapshot = await getDocs(collection(database, "team_roles"));
  const list = snapshot.docs.map((d) => {
    const data = d.data() as Partial<TeamMember>;
    return normalizeTeamMember({ ...data, email: data.email || d.id });
  });
  return list.sort((a, b) => a.email.localeCompare(b.email));
}

/** Admin only: assign or update a team member's role & permissions. */
export async function saveTeamRoleToFirestore(member: TeamMember): Promise<TeamMember> {
  const normalized = normalizeTeamMember(member);
  if (!normalized.email) {
    throw new Error("Team member email is required.");
  }
  const database = requireDb();
  await setDoc(
    doc(database, "team_roles", normalized.email),
    {
      email: normalized.email,
      name: normalized.name ?? null,
      role: normalized.role,
      permissions: normalized.permissions,
      active: normalized.active,
      ...(normalized.addedBy ? { addedBy: normalized.addedBy } : {}),
      updatedAt: serverTimestamp(),
      ...(normalized.createdAt ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true }
  );
  return normalized;
}

/** Admin only: revoke / remove a team member's role document by email. */
export async function deleteTeamRoleFromFirestore(email: string): Promise<void> {
  const cleanEmail = normalizeMemberEmail(email);
  if (!cleanEmail) return;
  await deleteDoc(doc(requireDb(), "team_roles", cleanEmail));
}

