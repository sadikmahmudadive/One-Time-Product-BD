import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
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
        const data = d.data() as Product;
        const inv = inventoryMap.get(d.id);
        return {
          ...data,
          slug: d.id,
          image: inv?.imageUrl || data.image,
          available: inv?.available ?? data.available,
          lowStockAt: inv?.lowStockAt ?? data.lowStockAt,
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
      base = { slug: docSnap.value.id, ...(docSnap.value.data() as Omit<Product, "slug">) };
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

  const data: Record<string, unknown> = {
    slug,
    name: product.name,
    category: product.category,
    kind: product.kind,
    summary: product.summary || "",
    price: product.price ?? null,
    tags: product.tags || [],
    specs: product.specs || [],
    updatedAt: serverTimestamp(),
  };

  if (product.image) data.image = product.image;
  if (product.capacityMl !== undefined) data.capacityMl = product.capacityMl;
  if (product.variants && product.variants.length > 0) data.variants = product.variants;

  await setDoc(docRef, data, { merge: true });

  if (product.available !== undefined || product.lowStockAt !== undefined || product.image) {
    await saveInventoryToFirestore(
      slug,
      product.available ?? 0,
      product.lowStockAt ?? 10,
      product.image
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
    await setDoc(
      doc(database, "products", product.slug),
      {
        ...product,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
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
  totalPrice: number | null;
  status: "pending" | "confirmed" | "shipped" | "cancelled";
  createdAt?: unknown;
}

/** Save an order to Firestore */
export async function saveOrderToFirestore(order: Omit<OrderRecord, "id" | "createdAt">): Promise<string> {
  const database = requireDb();
  const docRef = await addDoc(collection(database, "orders"), {
    ...order,
    status: order.status || "pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/** Retrieve an order by document ID */
export async function getOrderFromFirestore(orderId: string): Promise<OrderRecord | null> {
  const database = requireDb();
  const docSnap = await getDoc(doc(database, "orders", orderId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...(docSnap.data() as Omit<OrderRecord, "id">) };
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

