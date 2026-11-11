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
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
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
  const q = kind
    ? query(col, where("kind", "==", kind), orderBy("createdAt", "desc"))
    : query(col, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<EnquiryRecord, "id">),
  }));
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
  const snapshot = await getDocs(query(collection(requireDb(), "subscribers"), orderBy("createdAt", "desc"), limit(max)));
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NewsletterSubscription, "id">) }));
}

export interface InventoryRecord {
  slug: string;
  available: number;
  lowStockAt: number;
  updatedAt?: unknown;
}

/** Inventory levels are kept separately from catalogue copy and prices. */
export async function getInventoryFromFirestore(): Promise<InventoryRecord[]> {
  const snapshot = await getDocs(collection(requireDb(), "inventory"));
  return snapshot.docs.map((d) => ({ slug: d.id, ...(d.data() as Omit<InventoryRecord, "slug">) }));
}

export async function saveInventoryToFirestore(slug: string, available: number, lowStockAt: number): Promise<void> {
  await setDoc(doc(requireDb(), "inventory", slug), { available, lowStockAt, updatedAt: serverTimestamp() }, { merge: true });
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
  const snapshot = await getDocs(query(collection(database, "orders"), orderBy("createdAt", "desc"), limit(max)));
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<OrderRecord, "id">) }));
}

/** Advance an order through the fulfilment workflow. */
export async function updateOrderStatus(id: string, status: OrderRecord["status"]): Promise<void> {
  await updateDoc(doc(requireDb(), "orders", id), { status });
}

