import React, { useState, useMemo } from 'react';
import {
  Trash2,
  Edit2,
  TrendingUp,
  Search,
  ArrowUpDown,
  Plus,
  Minus,
  Check,
  X
} from 'lucide-react';
import { StockHolding, StockPriceDictionary, CurrencyConfig } from '../types/portfolio';
import { calculatePortfolioTotals, formatCurrency } from '../utils/fileExport';

interface HoldingsTableProps {
  holdings: StockHolding[];
  priceDict: StockPriceDictionary;
  currency: CurrencyConfig;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveHolding: (id: string) => void;
  onLoadPreset: (preset: string) => void;
}

type SortField = 'symbol' | 'quantity' | 'unitPrice' | 'totalValue' | 'weight';
type SortDirection = 'asc' | 'desc';

export const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings,
  priceDict,
  currency,
  onUpdateQuantity,
  onRemoveHolding,
  onLoadPreset,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('totalValue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQtyValue, setEditQtyValue] = useState<string>('');

  const { totalInvestment, positions } = useMemo(
    () => calculatePortfolioTotals(holdings, priceDict),
    [holdings, priceDict]
  );

  const filteredAndSortedPositions = useMemo(() => {
    let list = [...positions];

    // Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.symbol.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    return list;
  }, [positions, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const startEdit = (id: string, currentQty: number) => {
    setEditingId(id);
    setEditQtyValue(currentQty.toString());
  };

  const saveEdit = (id: string) => {
    const num = parseFloat(editQtyValue);
    if (!isNaN(num) && num > 0) {
      onUpdateQuantity(id, num);
    }
    setEditingId(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
      {/* Table Header and Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">
              Portfolio Holdings & Valuations
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {holdings.length} {holdings.length === 1 ? 'asset' : 'assets'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Individual positions calculated via unit price dictionary lookup
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by symbol or name..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      {holdings.length === 0 ? (
        <div className="p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-base font-medium text-white mb-1">
            No stock holdings yet
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Add stock tickers and quantities above, or load our quick starter preset to test the calculation.
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => onLoadPreset('sample')}
              className="text-xs font-semibold px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition shadow-sm"
            >
              Load AAPL & TSLA Preset
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 select-none">
                <th
                  onClick={() => handleSort('symbol')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-200 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Stock / Company</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('quantity')}
                  className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-slate-200 transition"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Quantity</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('unitPrice')}
                  className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-slate-200 transition"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Dictionary Price</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalValue')}
                  className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-slate-200 transition"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Total Investment</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('weight')}
                  className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-slate-200 transition"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Portfolio Weight</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center font-semibold text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredAndSortedPositions.map((pos) => {
                const isEditing = editingId === pos.id;
                const isDictStandard = Boolean(priceDict[pos.symbol.toUpperCase()]);

                return (
                  <tr
                    key={pos.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Symbol & Company Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-white text-xs">
                          {pos.symbol.slice(0, 4)}
                        </div>
                        <div>
                          <div className="font-mono font-bold text-slate-100 flex items-center gap-1.5">
                            <span>{pos.symbol}</span>
                            {isDictStandard && (
                              <span className="text-[10px] font-sans font-normal text-emerald-400 bg-emerald-500/10 px-1.5 rounded border border-emerald-500/20">
                                dict
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-[11px] truncate max-w-[140px] sm:max-w-[200px]">
                            {pos.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Quantity with inline adjuster */}
                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            min="0.001"
                            step="any"
                            value={editQtyValue}
                            onChange={(e) => setEditQtyValue(e.target.value)}
                            className="w-16 bg-slate-950 border border-emerald-500 rounded px-1.5 py-1 text-right font-mono text-white text-xs focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(pos.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                          <button
                            onClick={() => saveEdit(pos.id)}
                            className="p-1 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() =>
                              pos.quantity > 1 &&
                              onUpdateQuantity(pos.id, pos.quantity - 1)
                            }
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Decrease by 1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-medium text-slate-100 text-sm">
                            {pos.quantity.toLocaleString()}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(pos.id, pos.quantity + 1)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Increase by 1"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => startEdit(pos.id, pos.quantity)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-300 transition"
                            title="Edit shares manually"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Unit Price */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono text-slate-300">
                        {formatCurrency(pos.unitPrice, currency)}
                      </div>
                      <div className="text-[10px] text-slate-500">per share</div>
                    </td>

                    {/* Total Investment (Quantity * Unit Price) */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-white text-sm">
                        {formatCurrency(pos.totalValue, currency)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {pos.quantity} × {formatCurrency(pos.unitPrice, currency)}
                      </div>
                    </td>

                    {/* Portfolio Weight & Bar */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-semibold text-emerald-400">
                        {pos.weight.toFixed(1)}%
                      </div>
                      <div className="w-20 ml-auto bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, pos.weight)}%` }}
                        />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onRemoveHolding(pos.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title={`Remove ${pos.symbol}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Summary Footer */}
            <tfoot>
              <tr className="bg-slate-950 font-semibold border-t-2 border-slate-800 text-slate-300">
                <td className="py-3.5 px-4 font-mono">
                  TOTAL PORTFOLIO
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-200">
                  {positions.reduce((acc, p) => acc + p.quantity, 0).toLocaleString()} shares
                </td>
                <td className="py-3.5 px-4 text-right text-slate-500 text-xs font-normal">
                  Weighted Σ
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-400 text-base font-bold">
                  {formatCurrency(totalInvestment, currency)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                  100.0%
                </td>
                <td className="py-3.5 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
