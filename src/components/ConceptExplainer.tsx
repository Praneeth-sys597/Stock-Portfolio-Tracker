import React, { useState } from 'react';
import { BookOpen, Calculator, FileText, ArrowRightLeft, ChevronDown, ChevronUp } from 'lucide-react';

export const ConceptExplainer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-semibold text-white">
              Under the Hood: Key Programming Concepts in This Project
            </h4>
            <p className="text-[11px] text-slate-400">
              Dictionary Data Structures • Basic Arithmetic • Input / Output • File Handling
            </p>
          </div>
        </div>
        <div className="text-slate-400">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs bg-slate-950/40">
          {/* 1. Dictionary */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 font-semibold text-indigo-300 mb-1.5">
              <span className="w-5 h-5 rounded bg-indigo-500/20 flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Dictionary Lookup</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
              Prices are stored in a key-value dictionary (e.g.{' '}
              <code className="text-emerald-300">{"{\"AAPL\": 180, \"TSLA\": 250}"}</code>). Lookups run in O(1) time without API delays.
            </p>
            <div className="bg-slate-950 p-2 rounded text-[10px] font-mono text-slate-300 border border-slate-850">
              price = prices[symbol.upper()]
            </div>
          </div>

          {/* 2. Arithmetic */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 font-semibold text-emerald-300 mb-1.5">
              <span className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Basic Arithmetic</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
              Each stock line calculates quantity multiplied by price. Portfolio totals aggregate all position subtotals.
            </p>
            <div className="bg-slate-950 p-2 rounded text-[10px] font-mono text-slate-300 border border-slate-850">
              total = sum(q * p for q, p in items)
            </div>
          </div>

          {/* 3. Input & Output */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 font-semibold text-teal-300 mb-1.5">
              <span className="w-5 h-5 rounded bg-teal-500/20 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Input & Output</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
              Validates user input (numbers, ticker strings), handles unknown tickers gracefully, and presents real-time formatted feedback.
            </p>
            <div className="bg-slate-950 p-2 rounded text-[10px] font-mono text-slate-300 border border-slate-850">
              qty = float(input_quantity)
            </div>
          </div>

          {/* 4. File Handling */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 font-semibold text-amber-300 mb-1.5">
              <span className="w-5 h-5 rounded bg-amber-500/20 flex items-center justify-center text-[10px]">
                4
              </span>
              <span>File Handling (.csv / .txt)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
              Formats summary reports into structured CSV or ASCII tables and triggers browser file stream downloads or imports.
            </p>
            <div className="bg-slate-950 p-2 rounded text-[10px] font-mono text-slate-300 border border-slate-850">
              open("portfolio.csv", "w").write(...)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
