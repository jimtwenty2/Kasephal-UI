export interface CurrencyRate {
  ask: string;
  average: string;
  bid: string;
  date: string;
  key: string;
  unit: number;
}

export interface CurrencyRatesResponse {
  ex: CurrencyRate[];
}