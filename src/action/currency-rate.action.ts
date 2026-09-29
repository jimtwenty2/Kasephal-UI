"use server";

import { getUsdToKhrRateService } from "@/services/currency-rate.service";

export async function getUsdToKhrRateAction() {
  return getUsdToKhrRateService();
}
