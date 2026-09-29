import type { Contract } from "@/services/contract.service";
import type { Order } from "@/services/order.service";
import type { CurrencyCode } from "../_components/CurrencyToggle";

const ACTIVE_CONTRACT_STATUSES: Contract["status"][] = ["LOCKED"];

function toNumber(value: unknown): number {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function sameCurrency(
  value: { currencyCode?: string | null },
  currency: CurrencyCode,
) {
  return (value.currencyCode ?? "USD") === currency;
}

export function getActiveContractsByCurrency(
  contracts: Contract[],
  currency: CurrencyCode,
) {
  return contracts.filter(
    (contract) =>
      ACTIVE_CONTRACT_STATUSES.includes(contract.status) &&
      sameCurrency(contract, currency),
  );
}

export function getOrderByContractId(orders: Order[]) {
  return new Map(
    orders
      .filter((order) => order.contractId)
      .map((order) => [order.contractId as string, order]),
  );
}

export function getOrderRemainingAmount(order: Order): number {
  if (order.isCompleted) return 0;
  return Math.max(0, toNumber(order.remainingAmount));
}

export function getOrderEscrowBalance(order: Order): number {
  const explicitBalance = order.escrowBalance;
  if (explicitBalance != null) return Math.max(0, toNumber(explicitBalance));

  return Math.max(
    0,
    toNumber(order.escrowFunded) -
      toNumber(order.escrowReleased) -
      toNumber(order.escrowRefunded),
  );
}

export function getActiveContractTotals(
  contracts: Contract[],
  orders: Order[],
  currency: CurrencyCode,
) {
  const activeContracts = getActiveContractsByCurrency(contracts, currency);
  const ordersByContractId = getOrderByContractId(orders);

  return activeContracts.reduce(
    (totals, contract) => {
      const contractValue = toNumber(contract.totalPrice);
      const order = ordersByContractId.get(contract.contractId);

      totals.totalValue += contractValue;
      totals.remainingAmount += order
        ? getOrderRemainingAmount(order)
        : contractValue;
      totals.escrowBalance += order ? getOrderEscrowBalance(order) : 0;

      return totals;
    },
    {
      totalValue: 0,
      remainingAmount: 0,
      escrowBalance: 0,
    },
  );
}
