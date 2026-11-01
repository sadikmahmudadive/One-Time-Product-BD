export type EnquiryKind = "quote" | "contact";

/**
 * The one place enquiry forms send their data.
 *
 * TODO: there is no backend yet. This resolves after a short delay so the forms behave
 * end to end, but NOTHING IS TRANSMITTED. Before launch, replace the body with a real call
 * (a Route Handler that emails or forwards to WhatsApp / a CRM) and let it reject on failure —
 * the forms already show an error state when this throws.
 */
export async function submitEnquiry(_kind: EnquiryKind, _data: Record<string, string>): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
}
