import { auth } from "@/auth";
import { getCropProductsAction } from "@/action/crop-product.action";
import { normalizeUserRole } from "@/constants/role";
import CropProductMarketplaceClient from "../_components/CropProductMarketplaceClient";
import { getCropTypesAction } from "@/action/crop.action";
import { getProvincesAction } from "@/action/location.action";

const PAGE_SIZE = 12;

export default async function MarketplacePage() {
  const session = await auth();

  const role = normalizeUserRole(session?.user?.role);

  const [result, cropTypeResult, provinceResult] = await Promise.all([
    getCropProductsAction(1, PAGE_SIZE),
    getCropTypesAction(),
    getProvincesAction(),
  ]);

  const products =
    result?.data && result.data.length > 0
      ? result.data
      : [];
  const pagination = {
    page: result.pagination?.page && result.pagination.page > 0
      ? result.pagination.page
      : 1,
    size: result.pagination?.size ?? PAGE_SIZE,
    totalElements: result.pagination?.totalElements ?? products.length,
    totalPages: result.pagination?.totalPages ?? 1,
  };

  return (
    <CropProductMarketplaceClient
      products={products}
      role={role}
      pagination={pagination}
      initialCropTypes={cropTypeResult.data ?? []}
      initialProvinces={provinceResult.data ?? []}
    />
  );
}
