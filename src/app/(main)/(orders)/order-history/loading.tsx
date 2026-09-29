import OrderHistorySkeleton from "../_component/history-component/OrderHistorySkeleton";

// Shown automatically by Next.js while order-history/page.tsx awaits
// getOrdersService().
export default function Loading() {
  return <OrderHistorySkeleton />;
}
