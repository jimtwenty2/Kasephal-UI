import React from "react";
import OrderWithoutContractForm from "../../_component/order-component/CreateOrderWithoutContractForm";
import { redirect } from "next/navigation";
import {
  getCropProductByIdAction,
  getCropProductByPostIdAction,
} from "@/action/crop-product.action";
import { auth } from "@/auth";
import { getUserProfile } from "@/services/own-profile.service";
import Image from "next/image";
import { getPaymentCurrencyCode } from "@/utils/currency";
import { getUsdToKhrRateService } from "@/services/currency-rate.service";
import { getOrderByIdService, getOrdersService } from "@/services/order.service";
import type { CropProductPost } from "@/types/crop-product";

export const metadata = {
  title: "Create Order Without Contract — AgriLink",
  description: "Generate direct transactions instantly inside the marketplace workflow ecosystem.",
};

type PageProps = {
  searchParams: Promise<{
    postId?: string;
    farmerId?: string;
    chatRoomId?: string;
    sourceChatRoomId?: string;
    orderId?: string;
    mode?: string;
  }>;
};

function getCanonicalPostId(product: CropProductPost, fallback: string) {
  return product.postId || product.post?.postId || fallback;
}

export default async function CreateOrderWithoutContractPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { orderId, mode } = params;
  const isEditMode = mode === "edit" && Boolean(orderId);
  const existingOrder = isEditMode && orderId
    ? await getOrderByIdService(orderId)
    : null;

  const postId = params.postId ?? existingOrder?.post?.postId;
  const farmerId = params.farmerId ?? existingOrder?.farmerId;
  const chatRoomId = params.chatRoomId ?? existingOrder?.chatRoomId;

  if (!postId || !farmerId) {
    redirect("/");
  }

  // Fetch the product and the buyer's orders together so the "already has an
  // active order" redirect can fire as early as possible (otherwise the order
  // page lingers on screen while these run one after another).
  const [postProductResult, idProductResult, existingOrders] = await Promise.all([
    getCropProductByPostIdAction(postId),
    getCropProductByIdAction(postId),
    isEditMode
      ? Promise.resolve<Awaited<ReturnType<typeof getOrdersService>>>([])
      : getOrdersService(),
  ]);
  const product = postProductResult.data ?? idProductResult.data;

  if (!product) {
    redirect("/listing-product");
  }

  const canonicalPostId = getCanonicalPostId(product, postId);
  const activeOrder = !isEditMode
    ? existingOrders.find(
        (order) =>
          order.post?.postId === canonicalPostId &&
          order.farmerId === farmerId &&
          !order.isCompleted,
      )
    : null;

  if (activeOrder?.orderId) {
    if (activeOrder.chatRoomId) {
      redirect(`/chat?chatRoomId=${encodeURIComponent(activeOrder.chatRoomId)}`);
    }

    redirect(`/order-history/${activeOrder.orderId}`);
  }

  const cropName =
    product.cropName ??
    product.crop?.cropName ??
    existingOrder?.cropName ??
    product.title ??
    "Crop Product";
  const cropType = product.cropType ?? product.cropTypeName ?? product.crop?.cropTypeName ?? "Crop";
  const farmerName =
    existingOrder?.farmerName ?? product.farmerName ?? product.sellerName ?? "Farmer";
  const imageUrls = Array.isArray(product.imageUrls)
    ? product.imageUrls
    : product.imageUrls
      ? [product.imageUrls]
      : [];
  const [session, profile, khrPerUsd] = await Promise.all([
    auth(),
    getUserProfile().catch(() => null),
    getUsdToKhrRateService(),
  ]);
  const buyerName =
    existingOrder?.buyerName ??
    profile?.payload?.personalInfo.fullName ??
    session?.user?.email ??
    "Buyer";

  return (
      <main className="min-h-screen w-full bg-background font-thicccboi text-foreground">
        
        <div className="mt-9 min-w-full px-6">
          <div className="relative z-0 -mt-30 h-20 w-full overflow-hidden rounded-[28px]">
            <Image
              src="/assets/nav-bar/navbar_bg_image.png"
              alt="Hero Background"
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
          </div>
        </div>
        <OrderWithoutContractForm
          postId={canonicalPostId}
          farmerId={farmerId}
          chatRoomId={chatRoomId ?? ""}
          sourceChatRoomId={params.sourceChatRoomId ?? ""}
          buyerName={buyerName}
          pricePerUnit={existingOrder?.pricePerUnit ?? product.pricePerUnit}
          stockLeft={product.stockLeft}
          initialQuantity={existingOrder?.quantity}
          unitType={existingOrder?.unitType ?? product.unitType}
          currencyCode={getPaymentCurrencyCode(
            existingOrder?.currencyCode ?? product.currencyCode,
          )}
          cropName={cropName}
          cropType={cropType}
          title={product.title}
          farmerName={farmerName}
          imageUrls={imageUrls}
          khrPerUsd={khrPerUsd}
          orderId={existingOrder?.orderId}
          mode={isEditMode ? "edit" : "create"}
        />
      </main>
  );
}
