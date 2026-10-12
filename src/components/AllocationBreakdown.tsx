import React from 'react';
import { PieChart, Info } from 'lucide-react';
import { StockHolding, StockPriceDictionary, CurrencyConfig } from '../types/portfolio';
import { calculatePortfolioTotals, formatCurrency } from '../utils/fileExport';

interface AllocationBreakdownProps {
  holdings: StockHolding[];
  priceDict: StockPriceDictionary;
  currency: CurrencyConfig;
}

const PALETTE = [
  'bg-emerald-500 text-emerald-300 border-emerald-500/40',
  'bg-teal-500 text-teal-300 border-teal-500/40',
  'bg-indigo-500 text-indigo-300 border-indigo-500/40',
  'bg-cyan-500 text-cyan-300 border-cyan-500/40',
  'bg-blue-500 text-blue-300 border-blue-500/40',
  'bg-violet-500 text-violet-300 border-violet-500/40',
  'bg-amber-500 text-amber-300 border-amber-500/40',
  'bg-rose-500 text-rose-300 border-rose-500/40',
  'bg-fuchsia-500 text-fuchsia-300 border-fuchsia-500/40',
];

const RAW_COLORS = [
  '#10b981', // emerald
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#d946ef', // fuchsia
];

export const AllocationBreakdown: React.FC<AllocationBreakdownProps> = ({
  holdings,
  priceDict,
  currency,
}) => {
  const { totalInvestment, positions } = calculatePortfolioTotals(holdings, priceDict);

  if (holdings.length === 0 || totalInvestment === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <span>Asset Allocation & Diversification</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Relative weight of each stock in the overall portfolio
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Total: {formatCurrency(totalInvestment, currency)}
        </div>
      </div>

      {/* Multi-segment stacked progress bar */}
      <div className="mb-4">
        <div className="h-4 w-full bg-slate-950 rounded-lg overflow-hidden flex shadow-inner border border-slate-800/80">
          {positions.map((pos, idx) => {
            const color = RAW_COLORS[idx % RAW_COLORS.length];
            return (
              <div
                key={pos.id}
                title={`${pos.symbol}: ${pos.weight.toFixed(1)}% (${formatCurrency(
                  pos.totalValue,
                  currency
                )})`}
                style={{
                  width: `${pos.weight}%`,
                  backgroundColor: color,
                }}
                className="h-full transition-all duration-300 hover:brightness-125 cursor-pointer"
              />
            );
          })}
        </div>
      </div>

      {/* Grid of holdings allocation chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {positions.map((pos, idx) => {
          const colorHex = RAW_COLORS[idx % RAW_COLORS.length];
          return (
            <div
              key={pos.id}
              className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5 hover:border-slate-700 transition"
            >
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: colorHex }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-white">
                    {pos.symbol}
                  </span>
                  <span className="font-mono text-xs text-emerald-400 font-semibold">
                    {pos.weight.toFixed(1)}%
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {formatCurrency(pos.totalValue, currency)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
