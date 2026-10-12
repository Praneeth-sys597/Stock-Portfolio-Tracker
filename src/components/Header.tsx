import React from 'react';
import {
  TrendingUp,
  Download,
  BookOpen,
  RotateCcw,
  Upload,
  Coins
} from 'lucide-react';
import { CurrencyConfig } from '../types/portfolio';

interface HeaderProps {
  currency: CurrencyConfig;
  onCurrencyChange: (curr: CurrencyConfig) => void;
  onOpenDictionary: () => void;
  onOpenExport: (format?: 'csv' | 'txt') => void;
  onOpenImport: () => void;
  onLoadPreset: (presetKey: string) => void;
  onResetPortfolio: () => void;
  holdingsCount: number;
  dictCount: number;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', rate: 1.0 },
  { code: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'GBP', symbol: '£', rate: 0.79 },
  { code: 'JPY', symbol: '¥', rate: 152.0 },
  { code: 'INR', symbol: '₹', rate: 83.5 },
  { code: 'CAD', symbol: 'CA$', rate: 1.36 }
];

export const Header: React.FC<HeaderProps> = ({
  currency,
  onCurrencyChange,
  onOpenDictionary,
  onOpenExport,
  onOpenImport,
  onLoadPreset,
  onResetPortfolio,
  holdingsCount,
  dictCount
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950">
            <TrendingUp className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Stock Portfolio Tracker
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Calculator
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dictionary-driven price valuation • Total investment arithmetic • CSV/TXT export
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Currency Selector */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700 text-xs">
            <Coins className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            <select
              value={currency.code}
              onChange={(e) => {
                const found = CURRENCIES.find((c) => c.code === e.target.value);
                if (found) onCurrencyChange(found);
              }}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Dictionary Inspector Button */}
          <button
            onClick={onOpenDictionary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition"
            title="Inspect & edit the hardcoded stock price dictionary"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Price Dictionary</span>
            <span className="ml-0.5 px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded text-[10px]">
              {dictCount}
            </span>
          </button>

          {/* Presets dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition">
              <span>Sample Portfolios</span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-40 text-xs">
              <button
                onClick={() => onLoadPreset('sample')}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 transition flex items-center justify-between"
              >
                <span>Starter (AAPL, TSLA...)</span>
              </button>
              <button
                onClick={() => onLoadPreset('techGiants')}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 transition flex items-center justify-between"
              >
                <span>Big Tech Leaders</span>
              </button>
              <button
                onClick={() => onLoadPreset('aiCleanEnergy')}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 transition flex items-center justify-between"
              >
                <span>AI & Clean Tech</span>
              </button>
              <div className="border-t border-slate-700 my-1" />
              <button
                onClick={onResetPortfolio}
                className="w-full text-left px-3 py-2 text-rose-300 hover:bg-rose-950/40 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear All Holdings</span>
              </button>
            </div>
          </div>

          {/* Import File Button */}
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition"
            title="Import stocks from CSV or TXT file"
          >
            <Upload className="w-3.5 h-3.5 text-teal-400" />
            <span>Import</span>
          </button>

          {/* Export Button */}
          <button
            onClick={() => onOpenExport()}
            disabled={holdingsCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save / Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};
