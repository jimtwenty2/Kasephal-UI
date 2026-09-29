import CropProductClient from "../_components/listing-proudct/CropProductTable";
import { getOwnCropProducts } from "@/services/cropProduct.service";
import { getCropTypesAction } from "@/action/crop.action";
import { getProvincesAction } from "@/action/location.action";
import { getIdentityVerificationState } from "@/lib/identityVerification";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

type PageProps = {
  searchParams?: Promise<{
    page?: string | string[];
    size?: string | string[];
  }>;
};

function getPositiveInteger(
  value: string | string[] | undefined,
  fallback: number,
) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsedValue = Number(rawValue);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? Math.floor(parsedValue)
    : fallback;
}

export default async function CropProductPage({ searchParams }: PageProps) {
  const [cropTypeResult, provinceResult, verification] = await Promise.all([
    getCropTypesAction(),
    getProvincesAction(),
    getIdentityVerificationState(),
  ]);
  const resolvedSearchParams = await searchParams;
  const page = getPositiveInteger(resolvedSearchParams?.page, DEFAULT_PAGE);
  const size = getPositiveInteger(resolvedSearchParams?.size, DEFAULT_PAGE_SIZE);
  const result = await getOwnCropProducts(page, size);
  const products = result.error ? [] : result.data;
  const pagination = {
    page: result.pagination?.page && result.pagination.page > 0
      ? result.pagination.page
      : page,
    size: result.pagination?.size ?? size,
    totalElements: result.pagination?.totalElements ?? products.length,
    totalPages: result.pagination?.totalPages ?? 1,
  };

  return (
    <CropProductClient
      products={products}
      pagination={pagination}
      useEndpointPagination={!result.error}
      initialCropTypes={cropTypeResult.data ?? []}
      initialProvinces={provinceResult.data ?? []}
      identityVerification={verification}
      
    />
  );
}
