import { StockPriceDictionary, StockHolding } from '../types/portfolio';

// Core dictionary defining stock prices (as specified in requirements)
export const DEFAULT_STOCK_PRICES: StockPriceDictionary = {
  AAPL: { price: 180.0, name: 'Apple Inc.', sector: 'Technology' },
  TSLA: { price: 250.0, name: 'Tesla, Inc.', sector: 'Automotive / EV' },
  MSFT: { price: 420.0, name: 'Microsoft Corporation', sector: 'Software' },
  GOOGL: { price: 175.0, name: 'Alphabet Inc. (Google)', sector: 'Technology' },
  AMZN: { price: 185.0, name: 'Amazon.com, Inc.', sector: 'E-Commerce & Cloud' },
  NVDA: { price: 120.0, name: 'NVIDIA Corporation', sector: 'Semiconductors & AI' },
  META: { price: 500.0, name: 'Meta Platforms, Inc.', sector: 'Social Media' },
  NFLX: { price: 640.0, name: 'Netflix, Inc.', sector: 'Streaming & Media' },
  AMD: { price: 155.0, name: 'Advanced Micro Devices', sector: 'Semiconductors' },
  JPM: { price: 210.0, name: 'JPMorgan Chase & Co.', sector: 'Banking' },
  V: { price: 280.0, name: 'Visa Inc.', sector: 'Payments' },
  WMT: { price: 82.0, name: 'Walmart Inc.', sector: 'Retail' },
  DIS: { price: 96.0, name: 'The Walt Disney Company', sector: 'Entertainment' },
  COIN: { price: 235.0, name: 'Coinbase Global, Inc.', sector: 'Crypto & Fintech' }
};

export const PRESET_PORTFOLIOS: Record<string, { label: string; holdings: Omit<StockHolding, 'id' | 'addedAt'>[] }> = {
  sample: {
    label: 'Standard Starter (AAPL + TSLA)',
    holdings: [
      { symbol: 'AAPL', name: 'Apple Inc.', quantity: 15 },
      { symbol: 'TSLA', name: 'Tesla, Inc.', quantity: 10 },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', quantity: 20 },
      { symbol: 'MSFT', name: 'Microsoft Corporation', quantity: 5 }
    ]
  },
  techGiants: {
    label: 'Big Tech Leaders',
    holdings: [
      { symbol: 'AAPL', name: 'Apple Inc.', quantity: 25 },
      { symbol: 'MSFT', name: 'Microsoft Corporation', quantity: 15 },
      { symbol: 'GOOGL', name: 'Alphabet Inc. (Google)', quantity: 20 },
      { symbol: 'AMZN', name: 'Amazon.com, Inc.', quantity: 18 },
      { symbol: 'META', name: 'Meta Platforms, Inc.', quantity: 8 }
    ]
  },
  aiCleanEnergy: {
    label: 'AI & Next-Gen Tech',
    holdings: [
      { symbol: 'TSLA', name: 'Tesla, Inc.', quantity: 18 },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', quantity: 40 },
      { symbol: 'AMD', name: 'Advanced Micro Devices', quantity: 25 }
    ]
  }
};
