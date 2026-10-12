import React from 'react';
import { DollarSign, Layers, PieChart, Calculator, ArrowUpRight } from 'lucide-react';
import { CurrencyConfig, StockHolding, StockPriceDictionary } from '../types/portfolio';
import { calculatePortfolioTotals, formatCurrency } from '../utils/fileExport';

interface SummaryCardsProps {
  holdings: StockHolding[];
  priceDict: StockPriceDictionary;
  currency: CurrencyConfig;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  holdings,
  priceDict,
  currency,
}) => {
  const { totalInvestment, totalShares, positions, topHolding } = calculatePortfolioTotals(
    holdings,
    priceDict
  );

  const avgPricePerShare =
    totalShares > 0 ? totalInvestment / totalShares : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Investment Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800/90 border border-emerald-500/30 rounded-2xl p-5 shadow-lg shadow-emerald-950/20">
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
          <span>Total Investment</span>
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-4 h-4" />
          </span>
        </div>
        <div className="text-3xl font-extrabold text-white tracking-tight">
          {formatCurrency(totalInvestment, currency)}
        </div>
        <div className="mt-2.5 flex items-center text-xs text-emerald-400 font-medium">
          <Calculator className="w-3.5 h-3.5 mr-1 text-emerald-400/80" />
          <span>Formula: Σ (Qty × Unit Price)</span>
        </div>
      </div>

      {/* 2. Total Shares Held */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
          <span>Total Volume (Shares)</span>
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="w-4 h-4" />
          </span>
        </div>
        <div className="text-3xl font-extrabold text-white tracking-tight">
          {totalShares.toLocaleString()}
        </div>
        <div className="mt-2.5 flex items-center text-xs text-slate-400">
          <span>Across {holdings.length} stock position{holdings.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      {/* 3. Top Position */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
          <span>Largest Holding</span>
          <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <PieChart className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight truncate flex items-center gap-2">
          {topHolding ? (
            <>
              <span className="text-emerald-400 font-mono">{topHolding.symbol}</span>
              <span className="text-sm font-normal text-slate-400">
                ({topHolding.weight.toFixed(1)}%)
              </span>
            </>
          ) : (
            <span className="text-slate-500 text-lg font-normal">None yet</span>
          )}
        </div>
        <div className="mt-2.5 text-xs text-slate-400 truncate">
          {topHolding ? (
            <span>
              Valued at {formatCurrency(topHolding.totalValue, currency)} ({topHolding.quantity} shares)
            </span>
          ) : (
            <span>Add stocks to evaluate dominance</span>
          )}
        </div>
      </div>

      {/* 4. Weighted Average Share Value */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
          <span>Avg Price / Share</span>
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
        <div className="text-3xl font-extrabold text-white tracking-tight">
          {formatCurrency(avgPricePerShare, currency)}
        </div>
        <div className="mt-2.5 text-xs text-slate-400">
          <span>Investment value ÷ Total shares</span>
        </div>
      </div>
    </div>
  );
};
