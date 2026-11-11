import { isFirebaseConfigured } from "./firebase/config";
import { saveEnquiryToFirestore } from "./firebase/firestore";

export type EnquiryKind = "quote" | "contact";

/**
 * Handles submission of quotes and contact inquiries.
 * If Firebase is configured, records the submission into Cloud Firestore.
 * If Firebase is not yet configured, gracefully simulates the submission after a short delay.
 */
export async function submitEnquiry(kind: EnquiryKind, data: Record<string, string>): Promise<void> {
  if (isFirebaseConfigured) {
    await saveEnquiryToFirestore(kind, data);
  } else {
    // Development / demo fallback until .env.local has live Firebase credentials
    console.info(
      `[Firestore Demo] Firebase not configured in .env.local. Simulated enquiry submission (${kind}):`,
      data
    );
    await new Promise((resolve) => setTimeout(resolve, 600));
  }
}
