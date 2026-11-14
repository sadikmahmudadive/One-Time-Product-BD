import { OrderConfirmationView } from "@/components/checkout/OrderConfirmationView";

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const id = (await searchParams).order;
  return <OrderConfirmationView id={id} />;
}
