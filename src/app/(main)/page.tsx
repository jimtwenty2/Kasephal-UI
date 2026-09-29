import HomeClient from "./_components/HomeClient";
import { getCropDemands, getCropDemandsOwn } from "@/services/cropDemand.service";

const PAGE_SIZE = 4;
export default async function Page() {
  const result = await getCropDemands({ page: 1, size: PAGE_SIZE });

  return (
    <div>
      <HomeClient cropDemands={result.data } />
    </div>
  );
}