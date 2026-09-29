import EscrowTable from "./EscrowTable";
import { getAdminEscrowManagement } from "@/services/admin/escrow.service";
import type {
  AdminEscrowPeriod,
  AdminEscrowStatus,
} from "@/types/admin/escrow";

interface EscrowManagementPageProps {
  searchParams?: Promise<{
    status?: string;
    period?: string;
    page?: string;
  }>;
}

const STATUSES: AdminEscrowStatus[] = ["PENDING", "APPROVED", "REJECTED"];
const PERIODS: AdminEscrowPeriod[] = ["THIS_WEEK", "THIS_MONTH", "THIS_YEAR"];

function parseStatus(value?: string): AdminEscrowStatus | undefined {
  return STATUSES.includes(value as AdminEscrowStatus)
    ? (value as AdminEscrowStatus)
    : undefined;
}

function parsePeriod(value?: string): AdminEscrowPeriod {
  return PERIODS.includes(value as AdminEscrowPeriod)
    ? (value as AdminEscrowPeriod)
    : "THIS_MONTH";
}

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function EscrowManagementPage({
  searchParams,
}: EscrowManagementPageProps) {
  const params = await searchParams;
  const status = parseStatus(params?.status);
  const period = parsePeriod(params?.period);
  const page = parsePage(params?.page);
  const escrowManagement = await getAdminEscrowManagement({
    status,
    period,
    page,
    size: 8,
  });

  return (
    <main className="min-h-screen w-full p-8">
      <EscrowTable
        data={escrowManagement}
        activeStatus={status ?? "ALL"}
        activePeriod={period}
      />
    </main>
  );
}
