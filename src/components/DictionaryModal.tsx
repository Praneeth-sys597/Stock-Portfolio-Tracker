import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Plus,
  RotateCcw,
  Code2,
  Table as TableIcon,
  Check,
  Edit2
} from 'lucide-react';
import { StockPriceDictionary, CurrencyConfig } from '../types/portfolio';
import { formatCurrency } from '../utils/fileExport';

interface DictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceDict: StockPriceDictionary;
  onUpdateDictPrice: (symbol: string, price: number, name?: string, sector?: string) => void;
  onResetDict: () => void;
  currency: CurrencyConfig;
}

export const DictionaryModal: React.FC<DictionaryModalProps> = ({
  isOpen,
  onClose,
  priceDict,
  onUpdateDictPrice,
  onResetDict,
  currency,
}) => {
  const [activeTab, setActiveTab] = useState<'table' | 'code'>('table');
  const [newSymbol, setNewSymbol] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newName, setNewName] = useState('');
  const [newSector, setNewSector] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = newSymbol.trim().toUpperCase();
    const p = parseFloat(newPrice);
    if (!sym || isNaN(p) || p <= 0) return;

    onUpdateDictPrice(
      sym,
      p,
      newName.trim() || `${sym} Inc.`,
      newSector.trim() || 'General'
    );
    setNewSymbol('');
    setNewPrice('');
    setNewName('');
    setNewSector('');
  };

  const startEdit = (sym: string, curPrice: number) => {
    setEditingKey(sym);
    setEditPriceVal(curPrice.toString());
  };

  const saveEdit = (sym: string) => {
    const p = parseFloat(editPriceVal);
    if (!isNaN(p) && p > 0) {
      onUpdateDictPrice(sym, p);
    }
    setEditingKey(null);
  };

  // Generate python / js representation for display
  const simplifiedDict: Record<string, number> = {};
  for (const [k, v] of Object.entries(priceDict)) {
    simplifiedDict[k] = v.price;
  }
  const pythonCode = `# Stock Price Dictionary Definition
stock_prices = {
${Object.entries(simplifiedDict)
  .map(([k, v]) => `    "${k}": ${v},`)
  .join('\n')}
}

# Lookup example:
def get_investment(symbol, quantity):
    if symbol in stock_prices:
        return quantity * stock_prices[symbol]
    return 0.0
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Stock Price Dictionary</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                  {Object.keys(priceDict).length} tickers
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Key Concept: Key-Value dictionary mapping stock symbols to fixed market prices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls & Reset */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'table'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table View & Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'code'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Dictionary Data Structure</span>
            </button>
          </div>

          <button
            onClick={onResetDict}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
            title="Reset dictionary to initial default stocks"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'table' ? (
            <>
              {/* Add New Stock to Dictionary */}
              <form
                onSubmit={handleAdd}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs"
              >
                <div className="font-semibold text-white mb-2 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Define New Stock in Dictionary</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Ticker (e.g. NFLX)"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                    maxLength={8}
                    required
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:border-indigo-400 focus:outline-none"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Price (USD)"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    required
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:border-indigo-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:border-indigo-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg px-3 py-1.5 transition flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save to Dict</span>
                  </button>
                </div>
              </form>

              {/* Table of Entries */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Symbol (Key)</th>
                      <th className="py-2.5 px-3 font-semibold">Company Name</th>
                      <th className="py-2.5 px-3 font-semibold">Sector</th>
                      <th className="py-2.5 px-3 font-semibold text-right">
                        Defined Price (Value)
                      </th>
                      <th className="py-2.5 px-3 text-center">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {Object.entries(priceDict).map(([sym, item]) => {
                      const isEditing = editingKey === sym;
                      return (
                        <tr key={sym} className="hover:bg-slate-900/40">
                          <td className="py-2 px-3 font-mono font-bold text-indigo-300">
                            {sym}
                          </td>
                          <td className="py-2 px-3 text-slate-300">{item.name}</td>
                          <td className="py-2 px-3 text-slate-400">{item.sector || 'General'}</td>
                          <td className="py-2 px-3 text-right font-mono font-medium text-emerald-400">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  value={editPriceVal}
                                  onChange={(e) => setEditPriceVal(e.target.value)}
                                  className="w-20 bg-slate-900 border border-emerald-400 rounded px-1.5 py-0.5 text-right font-mono text-white text-xs"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit(sym);
                                    if (e.key === 'Escape') setEditingKey(null);
                                  }}
                                />
                                <button
                                  onClick={() => saveEdit(sym)}
                                  className="p-1 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                                >
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </button>
                              </div>
                            ) : (
                              formatCurrency(item.price, currency)
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {!isEditing && (
                              <button
                                onClick={() => startEdit(sym, item.price)}
                                className="p-1 text-slate-500 hover:text-slate-200 transition"
                                title="Edit unit price"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-semibold text-indigo-300">Key Concept Explained:</span>{' '}
                A dictionary maps keys (stock symbols like <code className="text-emerald-400">"AAPL"</code>) to values (unit price like <code className="text-emerald-400">180</code>). In your portfolio calculations, every total investment is calculated by multiplying user-input quantity by looking up the stock price in this dictionary: <code className="text-indigo-300">quantity * price_dict[symbol]</code>.
              </div>

              <div className="relative">
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                  {pythonCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close Dictionary
          </button>
        </div>
      </div>
    </div>
  );
};
