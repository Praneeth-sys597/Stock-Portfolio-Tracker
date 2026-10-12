/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, CURRENCIES } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { AddStockForm } from './components/AddStockForm';
import { HoldingsTable } from './components/HoldingsTable';
import { AllocationBreakdown } from './components/AllocationBreakdown';
import { DictionaryModal } from './components/DictionaryModal';
import { ExportModal } from './components/ExportModal';
import { ImportModal } from './components/ImportModal';
import { ConceptExplainer } from './components/ConceptExplainer';
import {
  StockHolding,
  StockPriceDictionary,
  CurrencyConfig,
} from './types/portfolio';
import { DEFAULT_STOCK_PRICES, PRESET_PORTFOLIOS } from './data/defaultStockPrices';

const LOCAL_STORAGE_HOLDINGS_KEY = 'stock_tracker_holdings_v1';
const LOCAL_STORAGE_DICT_KEY = 'stock_tracker_dict_v1';

export default function App() {
  // Initialize price dictionary
  const [priceDict, setPriceDict] = useState<StockPriceDictionary>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DICT_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved price dictionary:', e);
    }
    return DEFAULT_STOCK_PRICES;
  });

  // Initialize holdings with AAPL & TSLA as primary demonstration
  const [holdings, setHoldings] = useState<StockHolding[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HOLDINGS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved holdings:', e);
    }
    return [
      {
        id: 'holding-aapl-1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 15,
        addedAt: new Date().toISOString(),
      },
      {
        id: 'holding-tsla-2',
        symbol: 'TSLA',
        name: 'Tesla, Inc.',
        quantity: 10,
        addedAt: new Date().toISOString(),
      },
      {
        id: 'holding-nvda-3',
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        quantity: 20,
        addedAt: new Date().toISOString(),
      },
    ];
  });

  const [currency, setCurrency] = useState<CurrencyConfig>(CURRENCIES[0]);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'txt'>('csv');
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HOLDINGS_KEY, JSON.stringify(holdings));
    } catch (e) {
      console.error('Failed to save holdings to localStorage:', e);
    }
  }, [holdings]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_DICT_KEY, JSON.stringify(priceDict));
    } catch (e) {
      console.error('Failed to save price dictionary to localStorage:', e);
    }
  }, [priceDict]);

  // Add stock to portfolio
  const handleAddStock = (
    symbol: string,
    quantity: number,
    customPrice?: number,
    companyName?: string
  ) => {
    const cleanSym = symbol.toUpperCase().trim();

    // If custom price is provided or ticker isn't in dictionary, register in dictionary
    if (customPrice && customPrice > 0) {
      setPriceDict((prev) => ({
        ...prev,
        [cleanSym]: {
          price: customPrice,
          name: companyName || prev[cleanSym]?.name || `${cleanSym} Inc.`,
          sector: prev[cleanSym]?.sector || 'Custom Asset',
        },
      }));
    }

    const resolvedName =
      companyName ||
      priceDict[cleanSym]?.name ||
      `${cleanSym} Inc.`;

    setHoldings((prev) => {
      const existingIdx = prev.findIndex((h) => h.symbol === cleanSym);
      if (existingIdx >= 0) {
        // Update existing position
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: quantity,
          name: resolvedName,
        };
        return updated;
      } else {
        // Add new position
        const newHolding: StockHolding = {
          id: `holding-${cleanSym}-${Date.now()}`,
          symbol: cleanSym,
          name: resolvedName,
          quantity: quantity,
          addedAt: new Date().toISOString(),
        };
        return [newHolding, ...prev];
      }
    });
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    setHoldings((prev) =>
      prev.map((h) => (h.id === id ? { ...h, quantity: Math.max(0.001, newQty) } : h))
    );
  };

  const handleRemoveHolding = (id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  };

  const handleLoadPreset = (presetKey: string) => {
    const preset = PRESET_PORTFOLIOS[presetKey];
    if (!preset) return;

    const newHoldings: StockHolding[] = preset.holdings.map((item, idx) => ({
      id: `holding-${item.symbol}-${idx}-${Date.now()}`,
      symbol: item.symbol,
      name: item.name,
      quantity: item.quantity,
      addedAt: new Date().toISOString(),
    }));

    setHoldings(newHoldings);
  };

  const handleResetPortfolio = () => {
    setHoldings([]);
  };

  const handleUpdateDictPrice = (
    symbol: string,
    price: number,
    name?: string,
    sector?: string
  ) => {
    const cleanSym = symbol.toUpperCase().trim();
    setPriceDict((prev) => ({
      ...prev,
      [cleanSym]: {
        price,
        name: name || prev[cleanSym]?.name || `${cleanSym} Inc.`,
        sector: sector || prev[cleanSym]?.sector || 'General',
      },
    }));
  };

  const handleResetDict = () => {
    setPriceDict(DEFAULT_STOCK_PRICES);
  };

  const handleOpenExport = (format: 'csv' | 'txt' = 'csv') => {
    setExportFormat(format);
    setIsExportOpen(true);
  };

  const handleImportHoldings = (items: { symbol: string; quantity: number }[]) => {
    const newItems: StockHolding[] = items.map((item, idx) => {
      const sym = item.symbol.toUpperCase();
      const dictInfo = priceDict[sym];
      return {
        id: `imported-${sym}-${idx}-${Date.now()}`,
        symbol: sym,
        name: dictInfo ? dictInfo.name : `${sym} (Imported)`,
        quantity: item.quantity,
        addedAt: new Date().toISOString(),
      };
    });

    setHoldings(newItems);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onOpenExport={handleOpenExport}
        onOpenImport={() => setIsImportOpen(true)}
        onLoadPreset={handleLoadPreset}
        onResetPortfolio={handleResetPortfolio}
        holdingsCount={holdings.length}
        dictCount={Object.keys(priceDict).length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI / Summary Metric Cards */}
        <SummaryCards
          holdings={holdings}
          priceDict={priceDict}
          currency={currency}
        />

        {/* Input Form & Asset Allocation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Add Stock Position (Key concept: Input & Dictionary lookup) */}
          <div className="lg:col-span-12">
            <AddStockForm
              priceDict={priceDict}
              currency={currency}
              onAddStock={handleAddStock}
              existingHoldings={holdings}
            />
          </div>
        </div>

        {/* Visual Allocation Weight Bar */}
        <AllocationBreakdown
          holdings={holdings}
          priceDict={priceDict}
          currency={currency}
        />

        {/* Holdings Table with Live Subtotals */}
        <HoldingsTable
          holdings={holdings}
          priceDict={priceDict}
          currency={currency}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveHolding={handleRemoveHolding}
          onLoadPreset={handleLoadPreset}
        />

        {/* Key Concepts Educational Accordion */}
        <ConceptExplainer />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-slate-300 font-medium">Stock Portfolio Tracker</span> • Built with Dictionary Price Lookup & Real-Time Arithmetic
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsDictionaryOpen(true)}
              className="hover:text-emerald-400 transition"
            >
              View Dictionary
            </button>
            <span>•</span>
            <button
              onClick={() => handleOpenExport('csv')}
              className="hover:text-emerald-400 transition"
            >
              Export CSV
            </button>
            <span>•</span>
            <button
              onClick={() => handleOpenExport('txt')}
              className="hover:text-emerald-400 transition"
            >
              Export TXT
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        priceDict={priceDict}
        onUpdateDictPrice={handleUpdateDictPrice}
        onResetDict={handleResetDict}
        currency={currency}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        holdings={holdings}
        priceDict={priceDict}
        currency={currency}
        initialFormat={exportFormat}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        priceDict={priceDict}
        onImportHoldings={handleImportHoldings}
      />
    </div>
  );
}
