import MarketOverview from "./_components/sections/MarketOverviewSection";
import MarketPriceSection from "./_components/sections/MarketPriceSection";
import Image from "next/image";
import { getMarketPrices } from "@/services/market-price.service";
import { getOfficialDocuments } from "@/services/official-document.service";
import { calculateMarketStatistic } from "@/utils/market-price-statistic";
import { auth } from "@/auth";
import { getExchangeRatesService } from "@/services/exchange-rate.service";
import { getCropTypesService, getCropsService } from "@/services/crop.service";
import { getProvinces } from "@/services/locationFilter.service";
import MarketPriceHero from "./_components/MarketPriceHero";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    region?: string;
    cropType?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  await searchParams;

  const session = await auth();

  const isGovernment =
    String(session?.user?.role ?? "").toLowerCase() === "government";

  const [officialDocuments, marketPrices, exchangeRates] = await Promise.all([
    getOfficialDocuments(),
    getMarketPrices(),
    getExchangeRatesService(),
  ]);

  const safeMarketPrices = marketPrices ?? [];

  const usdKhrRate = exchangeRates.find((rate) => rate.key === "USD/KHR");

  const stats = calculateMarketStatistic(
    safeMarketPrices,
    Number(usdKhrRate?.average ?? 4100),
  );

  const [cropTypesResponse, cropsResponse, provincesResponse] =
    await Promise.all([
      getCropTypesService(),
      getCropsService(),
      getProvinces(),
    ]);

  const totalCropTypes = cropTypesResponse.payload.length;

  return (
    <div className="bg-[#fbf6e9]">
      {/* Hero Section */}
      <MarketPriceHero />

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-[10%] z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] translate-x-1/2 rounded-full bg-amber-300 opacity-15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[4%] left-0 z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] -translate-x-1/2 rounded-full bg-yellow-300 opacity-15 blur-3xl" />
        <Image
          src="/assets/srov.png"
          width={260}
          height={260}
          alt="srov"
          className="pointer-events-none absolute right-0 top-[15%] z-0 h-auto max-h-[50%] w-[clamp(240px,9vw,200px)] object-contain opacity-50"
        />
        <Image
          src="/assets/srov2.png"
          width={260}
          height={260}
          alt="srov2"
          className="pointer-events-none absolute bottom-0 left-0 z-0 h-auto max-h-[50%] w-[clamp(240px,11vw,200px)] object-contain opacity-50"
        />

        {/* Main Content */}
        <main className="relative z-10 mt-14 pb-12">
          <div className="mx-auto w-full max-w-[1300px] px-4">
            <div className="flex flex-col gap-14">
              <MarketOverview
                highestPriceCrop={stats.highestPriceCrop}
                lowestPriceCrop={stats.lowestPriceCrop}
                highestPriceInKHR={stats.highestPriceInKHR}
                lowestPriceInKHR={stats.lowestPriceInKHR}
                totalCropTypes={totalCropTypes}
                exchangeRate={usdKhrRate}
              />

              <MarketPriceSection
                marketPrices={marketPrices}
                officialDocuments={officialDocuments}
                cropTypes={cropTypesResponse.payload}
                crops={cropsResponse.payload}
                provinces={provincesResponse.data}
                isGovernment={isGovernment}
                usdKhrRate={Number(usdKhrRate?.average ?? 4100)}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
