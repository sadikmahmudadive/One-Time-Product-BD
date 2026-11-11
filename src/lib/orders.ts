import { isFirebaseConfigured } from "./firebase/config";
import { saveOrderToFirestore, type OrderRecord } from "./firebase/firestore";

export type CheckoutCustomer = OrderRecord["customer"];

/**
 * Creates an order record. Development mode generates a local reference so the
 * checkout can be exercised before Firestore credentials are supplied.
 */
export async function submitOrder(order: Omit<OrderRecord, "id" | "createdAt">): Promise<string> {
  if (isFirebaseConfigured) return saveOrderToFirestore(order);
  await new Promise((resolve) => setTimeout(resolve, 550));
  return `DEMO-${Date.now().toString(36).toUpperCase()}`;
}
