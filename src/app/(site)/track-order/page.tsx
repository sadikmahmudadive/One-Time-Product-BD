import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderTracker } from "@/components/orders/OrderTracker";

export const metadata: Metadata = {
  title: "Track Order — One Time Product BD",
  description:
    "Track your One Time Product BD order status in real time using your Order Reference ID or signed-in account.",
};

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="wrap" style={{ padding: "48px 0" }}>
          Loading order tracker…
        </div>
      }
    >
      <OrderTracker />
    </Suspense>
  );
}

