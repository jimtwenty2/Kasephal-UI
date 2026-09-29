import OrderDetailSkeleton from "../../_component/history-component/OrderDetailSkeleton";

// Shown automatically by Next.js while order-history/[id]/page.tsx awaits the
// order detail and the farmer/buyer profiles.
export default function Loading() {
  return <OrderDetailSkeleton />;
}
