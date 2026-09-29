import Image from "next/image";
import { notFound } from "next/navigation";

import CropProductDetails from "../../_components/CropProductDetailsComponent";
import { CropProductPost } from "@/types/crop-product";
import {
  getCropProductByIdAction,
  getCropProductByPostIdAction,
} from "@/action/crop-product.action";
import {
  getReviewsByCropProductIdService,
  getReviewsByPostIdService,
} from "@/services/ranking.service";
import { auth } from "@/auth";
import { normalizeUserRole, ROLES } from "@/constants/role";
import { getIdentityVerificationState } from "@/lib/identityVerification";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const baseCropProduct: CropProductPost = {
  cropProductPostId: "1",
  postId: "post-1",
  cropId: "crop-1",
  unitType: "TON",
  currencyCode: "USD",
  pricePerUnit: 120,
  totalQuantity: 500,
  stockLeft: 320,
  status: "AVAILABLE",
  title: "Premium Jasmine Rice Harvest",
  cropName: "Jasmine Rice",
  cropType: "Rice",
  sellerName: "Green Farm Cambodia",
  sellerProfileUrl: "seller-profile-1",
  location: "Battambang, Cambodia",
  imageUrls: [
    "/image-demand/product1.jpg",
    "/image-demand/product2.jpg",
    "/image-demand/product3.jpg",
  ],
  createdAt: "2026-05-10T09:00:00Z",
  updatedAt: "2026-05-15T10:00:00Z",
};

const cropProducts: CropProductPost[] = Array.from({ length: 8 }, (_, index) => {
  const id = String(index + 1);

  const states: {
    status: CropProductPost["status"];
    unitType: CropProductPost["unitType"];
  }[] = [
    { status: "AVAILABLE", unitType: "KG" },
    { status: "UNAVAILABLE", unitType: "KG" },
  ];

  const currentState = states[index % states.length];

  return {
    ...baseCropProduct,
    cropProductPostId: id,
    postId: `post-${id}`,
    cropId: `crop-${id}`,
    title: `Premium Crop Product ${id}`,
    unitType: currentState.unitType,
    status: currentState.status,
    pricePerUnit: 80 + index * 5,
    totalQuantity: 200 + index * 10,
    stockLeft: currentState.status === "AVAILABLE" ? 150 + index * 6 : 0,
  };
});

async function getCropProduct(id: string): Promise<CropProductPost | null> {
  const [postResult, productResult] = await Promise.all([
    getCropProductByPostIdAction(id),
    getCropProductByIdAction(id),
  ]);

  return (
    postResult.data ??
    productResult.data ??
    cropProducts.find(
      (item) => item.cropProductPostId === id || item.cropProductId === id || item.postId === id,
    ) ?? null
  );
}

async function getFarmerReviews(product: CropProductPost) {
  const postId = product.postId ?? product.post?.postId;
  const cropProductId =
    product.cropProductId ??
    product.cropProductPostId ??
    product.cropProduct?.cropProductId;

  if (postId) {
    const reviewsByPost = await getReviewsByPostIdService(postId);
    if (reviewsByPost.data.length > 0 || !cropProductId) {
      return reviewsByPost.data;
    }
  }

  if (cropProductId) {
    const reviewsByCropProduct =
      await getReviewsByCropProductIdService(cropProductId);
    return reviewsByCropProduct.data;
  }

  return [];
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  const product = await getCropProduct(id);

  if (!product) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: `${product.cropName} — ${product.title}`,
    description: `${product.title} from ${product.sellerName}`,
  };
}

export default async function CropProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  const product = await getCropProduct(id);

  if (!product) notFound();

  const reviews = await getFarmerReviews(product);
  const session = await auth();
  const role = normalizeUserRole(session?.user?.role);
  const identityVerification =
    role === ROLES.BUYER || role === ROLES.GOVERNMENT
      ? await getIdentityVerificationState()
      : null;

  return (
    <div>
      <section className="mt-9 w-full px-3 sm:px-6">
        <div className="relative z-0 -mt-24 h-16 w-full overflow-hidden rounded-[20px] sm:-mt-30 sm:h-20 sm:rounded-[28px]">
          <Image
            src="/assets/nav-bar/navbar_bg_image.png"
            alt="Hero Background"
            fill
            priority
            className="object-cover"
          />
        </div>
      </section>
      <main className="relative min-h-screen overflow-x-hidden bg-[#FBF6E9] font-thicccboi">
        <CropProductDetails
          data={product}
          reviews={reviews}
          role={role}
          identityVerification={identityVerification}
        />
      </main>
    </div>
    
  );
}
