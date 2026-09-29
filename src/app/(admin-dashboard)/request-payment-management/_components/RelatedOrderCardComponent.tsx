import { formatOrderDisplayId } from "./ShareComponent";

export default function RelatedOrderCard({ orderId }: { orderId: string }) {
 return (
  <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
      Related Order
    </p>
    <div className="mt-2 flex items-center justify-between">
      <p className="text-sm font-semibold text-stone-800">
        {formatOrderDisplayId(orderId)}
      </p>
      
      {/* Added the opening "a" tag here */}
      {/* <a 
        href={`/admin/orders/${orderId}`}
        aria-label={`Open order ${orderId}`}
        className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
      >
        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
      </a> */}
    </div>
  </div>
);
}
