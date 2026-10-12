import React, { useState, useEffect } from 'react';
import { Plus, Check, HelpCircle, Search, Sparkles, AlertCircle } from 'lucide-react';
import { StockPriceDictionary, CurrencyConfig, StockHolding } from '../types/portfolio';
import { formatCurrency } from '../utils/fileExport';

interface AddStockFormProps {
  priceDict: StockPriceDictionary;
  currency: CurrencyConfig;
  onAddStock: (symbol: string, quantity: number, customPrice?: number, companyName?: string) => void;
  onSelectFromDict?: (symbol: string) => void;
  existingHoldings: StockHolding[];
}

export const AddStockForm: React.FC<AddStockFormProps> = ({
  priceDict,
  currency,
  onAddStock,
  existingHoldings,
}) => {
  const [symbolInput, setSymbolInput] = useState('AAPL');
  const [quantityInput, setQuantityInput] = useState<number | string>(10);
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [customNameInput, setCustomNameInput] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const cleanSymbol = symbolInput.trim().toUpperCase();
  const dictEntry = priceDict[cleanSymbol];

  // Determine current effective price
  const isCustomStock = !dictEntry && cleanSymbol.length > 0;
  const unitPrice = dictEntry
    ? dictEntry.price
    : parseFloat(customPriceInput) > 0
    ? parseFloat(customPriceInput)
    : 0;

  const validQty = typeof quantityInput === 'number' ? quantityInput : parseFloat(quantityInput);
  const isQtyValid = !isNaN(validQty) && validQty > 0;
  const calculatedSubtotal = isQtyValid ? validQty * unitPrice : 0;

  // Check if stock already exists in holdings
  const existingHolding = existingHoldings.find((h) => h.symbol === cleanSymbol);

  // Quick pick stock suggestions from dictionary (top prominent ones including AAPL & TSLA)
  const quickPicks = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanSymbol) return;

    if (!isQtyValid) {
      setFeedbackMsg('Please enter a valid quantity greater than 0');
      return;
    }

    if (!dictEntry && (!customPriceInput || parseFloat(customPriceInput) <= 0)) {
      setFeedbackMsg(`Please define a unit price for ${cleanSymbol}`);
      return;
    }

    const price = !dictEntry ? parseFloat(customPriceInput) : undefined;
    const name = !dictEntry && customNameInput.trim() ? customNameInput.trim() : undefined;

    onAddStock(cleanSymbol, validQty, price, name);

    setFeedbackMsg(`Added ${validQty} shares of ${cleanSymbol}!`);
    setTimeout(() => setFeedbackMsg(null), 3000);

    // Keep symbol or clear custom
    if (!dictEntry) {
      setCustomPriceInput('');
      setCustomNameInput('');
    }
  };

  const handleQuickPick = (sym: string) => {
    setSymbolInput(sym);
    setCustomPriceInput('');
    setCustomNameInput('');
  };

  const adjustQty = (delta: number) => {
    const current = isQtyValid ? validQty : 0;
    const next = Math.max(1, current + delta);
    setQuantityInput(next);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <span>Add Stock Position</span>
            <span className="text-xs font-normal text-slate-400">
              (Dictionary Price Lookup)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Type any ticker or pick from predefined dictionary prices
          </p>
        </div>

        {/* Concept Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Dictionary Lookup: <code className="text-indigo-200 font-mono">prices[symbol]</code></span>
        </div>
      </div>

      {/* Quick Pick Chips */}
      <div className="mb-4">
        <div className="text-xs font-medium text-slate-400 mb-2 flex items-center justify-between">
          <span>Quick Select from Dictionary:</span>
          <span className="text-[11px] text-slate-500">Click to auto-fill</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickPicks.map((sym) => {
            const item = priceDict[sym];
            const isSelected = cleanSymbol === sym;
            return (
              <button
                key={sym}
                type="button"
                onClick={() => handleQuickPick(sym)}
                className={`text-xs px-2.5 py-1 rounded-lg font-mono font-medium border transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                }`}
              >
                <span>{sym}</span>
                {item && (
                  <span className="text-[11px] font-sans text-slate-400">
                    {formatCurrency(item.price, currency)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Stock Symbol Input */}
          <div className="md:col-span-5">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Stock Ticker / Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={symbolInput}
                onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
                placeholder="e.g. AAPL, TSLA, MSFT"
                maxLength={10}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
              />
              <div className="absolute right-3 top-2.5 text-slate-500 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
            </div>

            {/* Price Lookup Feedback */}
            <div className="mt-1.5 text-xs">
              {dictEntry ? (
                <div className="flex items-center text-emerald-400 gap-1.5">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    <strong>{dictEntry.name}</strong> •{' '}
                    <span className="font-semibold">
                      {formatCurrency(dictEntry.price, currency)}
                    </span>
                    /share (In Dictionary)
                  </span>
                </div>
              ) : cleanSymbol ? (
                <div className="flex items-center text-amber-400 gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Ticker not in default dictionary. Enter price below:</span>
                </div>
              ) : (
                <span className="text-slate-500">Enter ticker to look up price</span>
              )}
            </div>
          </div>

          {/* Quantity Input */}
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Quantity (Shares)
            </label>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => adjustQty(-5)}
                className="px-2.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold transition border border-slate-700"
                title="Minus 5"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => adjustQty(-1)}
                className="px-2.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold transition border border-slate-700"
                title="Minus 1"
              >
                -1
              </button>
              <input
                type="number"
                min="0.001"
                step="any"
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                placeholder="10"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-center font-mono font-medium text-white focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                type="button"
                onClick={() => adjustQty(1)}
                className="px-2.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold transition border border-slate-700"
                title="Plus 1"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => adjustQty(5)}
                className="px-2.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold transition border border-slate-700"
                title="Plus 5"
              >
                +5
              </button>
            </div>

            {/* Quick quantity chips */}
            <div className="flex items-center gap-1 mt-1.5">
              {[5, 10, 25, 50, 100].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuantityInput(q)}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    Number(quantityInput) === q
                      ? 'bg-slate-700 text-emerald-300 font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Action / Add Button */}
          <div className="md:col-span-3 flex flex-col justify-end">
            <button
              type="submit"
              disabled={!cleanSymbol || !isQtyValid || unitPrice <= 0}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{existingHolding ? 'Update Position' : 'Add to Portfolio'}</span>
            </button>
          </div>
        </div>

        {/* If Custom / Unknown Stock, show Custom Price & Name Inputs */}
        {isCustomStock && (
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-amber-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-amber-300 font-medium mb-1">
                Define Price for {cleanSymbol} ({currency.code}) *
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={customPriceInput}
                onChange={(e) => setCustomPriceInput(e.target.value)}
                placeholder="e.g. 75.50"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Company Name (Optional)
              </label>
              <input
                type="text"
                value={customNameInput}
                onChange={(e) => setCustomNameInput(e.target.value)}
                placeholder="e.g. Palantir Technologies"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Real-time Arithmetic Breakdown Preview */}
        {isQtyValid && unitPrice > 0 && (
          <div className="bg-slate-950/60 rounded-xl px-4 py-2.5 border border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Calculation Preview:</span>
              <span className="font-mono text-white">
                {validQty} shares × {formatCurrency(unitPrice, currency)}
              </span>
              <span className="text-slate-500">=</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                {formatCurrency(calculatedSubtotal, currency)}
              </span>
            </div>

            {existingHolding && (
              <span className="text-[11px] text-amber-400">
                Note: {cleanSymbol} already in portfolio ({existingHolding.quantity} shares). This will update it.
              </span>
            )}
          </div>
        )}

        {/* Feedback alert */}
        {feedbackMsg && (
          <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>{feedbackMsg}</span>
          </div>
        )}
      </form>
    </div>
  );
};
