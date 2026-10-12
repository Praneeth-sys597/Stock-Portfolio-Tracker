export interface StockHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  addedAt: string;
}

export interface StockPriceItem {
  price: number;
  name: string;
  sector?: string;
}

export type StockPriceDictionary = Record<string, StockPriceItem>;

export interface CurrencyConfig {
  code: string;
  symbol: string;
  rate: number; // Multiplier against USD
}

export type ExportFormat = 'csv' | 'txt';
