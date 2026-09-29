import { Suspense } from "react";
import { auth } from "@/auth";
import DashboardClient from "./_components/DashboardClient";

import { getOrdersService } from "@/services/order.service";
import type { Order } from "@/services/order.service";

import { getContractsService } from "@/services/contract.service";
import type { Contract } from "@/services/contract.service";

import { getExchangeRatesService } from "@/services/exchange-rate.service";
import type { ExchangeRate } from "@/services/exchange-rate.service";

import {
  getCropDemandsService,
  type CropDemandItem,
} from "@/services/crop-demand.service";

import { getCropDemandsOwn } from "@/services/cropDemand.service";

import {
  getCropProductsService,
  getTopCropsByValue,
  getTopCropsByVolume,
} from "@/services/crop-product.service";
import type {
  CropProduct,
  TopValueCrop,
  TopVolumeCrop,
} from "@/services/crop-product.service";

import { getOwnCropProducts } from "@/services/cropProduct.service";
import type { CropProductPost } from "@/types/crop-product";

import { getMarketPrices } from "@/services/market-price.service";
import type { MarketPrice } from "@/types/market-price";

import { getCurrentUserProfileServerService } from "@/services/profile.service";
import type { UserProfile } from "@/services/profile.service";

import { getCropTypesService, getCropsService } from "@/services/crop.service";
import type { Crop, CropType } from "@/types/cropType";
import type { GovernmentLeadingCrop } from "@/types/overview-dashboard";

import DashboardLoading from "./_components/DashboardLoading";
import { getBuyerDashboardOverviewService } from "@/services/dashboard/buyer-overview.service";
import { getFarmerDashboardOverviewService } from "@/services/dashboard/farmer-overview.service";
import { getGovernmentDashboardOverviewService } from "@/services/dashboard/government-overview.service";

export const dynamic = "force-dynamic";

function buildTopValueCrops(crops: GovernmentLeadingCrop[]): TopValueCrop[] {
  return crops.map((item) => ({
    rank: item.rank,
    name: item.cropName,
    value: `${Number(item.value ?? 0).toLocaleString()} KHR`,
  }));
}

function buildTopVolumeCrops(crops: GovernmentLeadingCrop[]): TopVolumeCrop[] {
  return crops.map((item) => ({
    rank: item.rank,
    name: item.cropName,
    volume: `${Number(item.volumeKg ?? 0).toLocaleString()} KG`,
  }));
}

async function DashboardData() {
  const session = await auth();
  const currentRole = session?.user?.role?.toUpperCase();

  if (currentRole === "FARMER") {
    const farmerOverview = await getFarmerDashboardOverviewService();

    return (
      <DashboardClient
        orders={farmerOverview.orders}
        contracts={farmerOverview.contracts}
        exchangeRates={farmerOverview.exchangeRates}
        cropDemands={farmerOverview.cropDemands}
        ownCropDemands={[]}
        cropProducts={[]}
        ownCropProducts={farmerOverview.ownCropProducts}
        marketPrices={[]}
        topValueCrops={[]}
        topVolumeCrops={[]}
        profile={farmerOverview.profile}
        cropTypes={[]}
        totalCrops={0}
        farmerActiveCropPosts={farmerOverview.stats.activeCropPosts}
        farmerTotalContracts={farmerOverview.stats.totalContracts}
        farmerActiveContracts={farmerOverview.stats.activeContracts}
        farmerAvailableWithdrawUsd={farmerOverview.stats.availableWithdrawUsd}
        farmerAvailableWithdrawKhr={farmerOverview.stats.availableWithdrawKhr}
      />
    );
  }

  if (currentRole === "BUYER") {
    const buyerOverview = await getBuyerDashboardOverviewService();

    return (
      <DashboardClient
        orders={buyerOverview.orders}
        contracts={buyerOverview.contracts}
        exchangeRates={buyerOverview.exchangeRates}
        cropDemands={[]}
        ownCropDemands={buyerOverview.ownCropDemands}
        cropProducts={buyerOverview.cropProducts}
        ownCropProducts={[]}
        marketPrices={[]}
        topValueCrops={[]}
        topVolumeCrops={[]}
        profile={buyerOverview.profile}
        cropTypes={[]}
        totalCrops={0}
        buyerTotalContracts={buyerOverview.stats.totalContracts}
        buyerActiveContracts={buyerOverview.stats.activeContracts}
        buyerAvailableRefundUsd={buyerOverview.stats.availableRefundUsd}
        buyerAvailableRefundKhr={buyerOverview.stats.availableRefundKhr}
      />
    );
  }

  if (currentRole === "GOVERNMENT") {
    const governmentOverview = await getGovernmentDashboardOverviewService();

    return (
      <DashboardClient
        orders={governmentOverview.orders}
        contracts={governmentOverview.contracts}
        exchangeRates={governmentOverview.exchangeRates}
        cropDemands={[]}
        ownCropDemands={[]}
        cropProducts={governmentOverview.cropProducts}
        ownCropProducts={[]}
        marketPrices={governmentOverview.marketPrices}
        topValueCrops={buildTopValueCrops(governmentOverview.leadingCrops.topByValue)}
        topVolumeCrops={buildTopVolumeCrops(governmentOverview.leadingCrops.topByVolume)}
        profile={governmentOverview.profile}
        cropTypes={governmentOverview.cropTypes}
        totalCrops={governmentOverview.stats.totalCropNames}
        governmentPriceChanges={governmentOverview.priceChanges}
        governmentPriceHistory={governmentOverview.priceHistory}
        governmentMonthlyOrders={governmentOverview.monthlyOrders}
        governmentTotalCropNames={governmentOverview.stats.totalCropNames}
        governmentTotalCropTypes={governmentOverview.stats.totalCropTypes}
        governmentTotalContracts={governmentOverview.stats.totalContracts}
        governmentTotalOrders={governmentOverview.stats.totalOrders}
      />
    );
  }

  const [
    ordersResult,
    contractsResult,
    exchangeRatesResult,
    cropDemandsResult,
    ownCropDemandsResult,
    cropProductsResult,
    ownCropProductsResult,
    marketPricesResult,
    topValueCropsResult,
    topVolumeCropsResult,
    profileResult,
    cropTypesResult,
    cropsResult,
  ] = await Promise.allSettled([
    getOrdersService(),
    getContractsService(),
    getExchangeRatesService(),
    getCropDemandsService({ size: 3 }),
    getCropDemandsOwn({ size: 3 }),
    getCropProductsService({ size: 3 }),
    getOwnCropProducts(1, 3),
    getMarketPrices(),
    getTopCropsByValue(3),
    getTopCropsByVolume(3),
    getCurrentUserProfileServerService(),
    getCropTypesService(),
    getCropsService(),
  ]);

  const orders =
    ordersResult.status === "fulfilled" ? (ordersResult.value as Order[]) : [];

  const contracts =
    contractsResult.status === "fulfilled"
      ? (contractsResult.value as Contract[])
      : [];

  const exchangeRates =
    exchangeRatesResult.status === "fulfilled"
      ? (exchangeRatesResult.value as ExchangeRate[])
      : [];

  const cropDemands =
    cropDemandsResult.status === "fulfilled"
      ? (cropDemandsResult.value as CropDemandItem[])
      : [];

  const ownCropDemands =
    ownCropDemandsResult.status === "fulfilled"
      ? (ownCropDemandsResult.value.data as CropDemandItem[])
      : [];

  const cropProducts =
    cropProductsResult.status === "fulfilled"
      ? (cropProductsResult.value as { items: CropProduct[] }).items
      : [];

  const ownCropProducts =
    ownCropProductsResult.status === "fulfilled"
      ? (ownCropProductsResult.value.data as CropProductPost[])
      : [];

  const marketPrices =
    marketPricesResult.status === "fulfilled"
      ? (marketPricesResult.value as MarketPrice[])
      : [];

  const topValueCrops =
    topValueCropsResult.status === "fulfilled"
      ? (topValueCropsResult.value as TopValueCrop[])
      : [];

  const topVolumeCrops =
    topVolumeCropsResult.status === "fulfilled"
      ? (topVolumeCropsResult.value as TopVolumeCrop[])
      : [];

  const profile =
    profileResult.status === "fulfilled"
      ? ((profileResult.value as { payload?: UserProfile | null }).payload ??
        null)
      : null;

  const cropTypes =
    cropTypesResult.status === "fulfilled"
      ? ((cropTypesResult.value as { payload: CropType[] }).payload ?? [])
      : [];

  const totalCrops =
    cropsResult.status === "fulfilled"
      ? ((cropsResult.value as { payload: Crop[] }).payload ?? []).length
      : 0;

  return (
    <DashboardClient
      orders={orders}
      contracts={contracts}
      exchangeRates={exchangeRates}
      cropDemands={cropDemands}
      ownCropDemands={ownCropDemands}
      cropProducts={cropProducts}
      ownCropProducts={ownCropProducts}
      marketPrices={marketPrices}
      topValueCrops={topValueCrops}
      topVolumeCrops={topVolumeCrops}
      profile={profile}
      cropTypes={cropTypes}
      totalCrops={totalCrops}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardData />
    </Suspense>
  );
}
