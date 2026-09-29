import CreateCropProductForm from "../../_components/FormCropProductComponent";
import { cropProducts } from "@/data/cropProducts";
import { notFound } from "next/navigation";
import {
  getCropProductByIdAction,
  getCropProductByPostIdAction,
} from "@/action/crop-product.action";
import { getCropsAction, getCropTypesAction } from "@/action/crop.action";
import RequireVerifiedIdentity from "@/components/RequireVerifiedIdentity";
import { getIdentityVerificationState } from "@/lib/identityVerification";
import type { CropProductPost } from "@/types/crop-product";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function getProductImages(product?: CropProductPost | null) {
  if (!product) return [];

  const postWithImageAliases = product.post as
    | (CropProductPost["post"] & {
        imageUrls?: string | string[];
        thumbnailUrl?: string | string[];
      })
    | undefined;
  const imageSources = [
    product.imageUrls,
    product.thumbnailUrl,
    postWithImageAliases?.images,
    postWithImageAliases?.imageUrls,
    postWithImageAliases?.thumbnailUrl,
  ];

  return imageSources
    .flatMap((value) => (Array.isArray(value) ? value : value ? [value] : []))
    .map((image) => image.trim())
    .filter((image) => image && image !== "string");
}

function withFallbackImages(
  product: CropProductPost,
  fallbackProduct?: CropProductPost | null,
) {
  if (getProductImages(product).length > 0 || !fallbackProduct) {
    return product;
  }

  const fallbackImages = getProductImages(fallbackProduct);

  if (fallbackImages.length === 0) {
    return product;
  }

  return {
    ...product,
    imageUrls: fallbackImages,
    thumbnailUrl: fallbackProduct.thumbnailUrl ?? fallbackImages[0],
    post: {
      ...product.post,
      ...fallbackProduct.post,
      images: fallbackImages,
    },
  };
}

export default async function EditCropProductPage({ params }: Props) {
  const { id } = await params;

  const [
    postProductResult,
    productResult,
    cropResult,
    cropTypeResult,
    verification,
  ] = await Promise.all([
    getCropProductByPostIdAction(id),
    getCropProductByIdAction(id),
    getCropsAction(),
    getCropTypesAction(),
    getIdentityVerificationState(),
  ]);

  const fallbackProduct = cropProducts.find(
    (item) =>
      item.cropProductPostId === id ||
      item.cropProductId === id ||
      item.postId === id,
  );

  const primaryProduct =
    productResult?.data ?? postProductResult?.data ?? fallbackProduct;

  const postFallbackResult =
    primaryProduct &&
    getProductImages(primaryProduct).length === 0 &&
    primaryProduct.postId &&
    primaryProduct.postId !== id
      ? await getCropProductByPostIdAction(primaryProduct.postId)
      : null;

  const product = primaryProduct
    ? withFallbackImages(
        primaryProduct,
        postFallbackResult?.data ?? postProductResult?.data ?? fallbackProduct,
      )
    : null;

  if (!product) {
    notFound();
  }

  const productFormKey =
    product.cropProductId ?? product.cropProductPostId ?? product.postId ?? id;

  return (
    <RequireVerifiedIdentity
      isVerifiedIdentity={verification.isVerified}
      status={verification.status}
      rejectionReason={verification.rejectionReason}
    >
      <CreateCropProductForm
        key={productFormKey}
        product={product}
        crops={cropResult?.data ?? []}
        cropTypes={cropTypeResult?.data ?? []}
      />
    </RequireVerifiedIdentity>
  );
}
