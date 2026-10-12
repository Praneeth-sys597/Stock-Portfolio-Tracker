import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  FileText,
  Download,
  Copy,
  Check,
  FileCheck
} from 'lucide-react';
import { StockHolding, StockPriceDictionary, CurrencyConfig } from '../types/portfolio';
import { generateCSV, generateTXT, downloadFile } from '../utils/fileExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdings: StockHolding[];
  priceDict: StockPriceDictionary;
  currency: CurrencyConfig;
  initialFormat?: 'csv' | 'txt';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  holdings,
  priceDict,
  currency,
  initialFormat = 'csv',
}) => {
  const [format, setFormat] = useState<'csv' | 'txt'>(initialFormat);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const csvContent = generateCSV(holdings, priceDict, currency);
  const txtContent = generateTXT(holdings, priceDict, currency);

  const activeContent = format === 'csv' ? csvContent : txtContent;
  const fileName =
    format === 'csv'
      ? `portfolio_tracker_${new Date().toISOString().slice(0, 10)}.csv`
      : `portfolio_report_${new Date().toISOString().slice(0, 10)}.txt`;

  const handleDownload = () => {
    const mime = format === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';
    downloadFile(activeContent, fileName, mime);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Save & Export Portfolio</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                  File Handling
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Export your stock calculations into standard .csv or formatted .txt files
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

        {/* Format Selector Bar */}
        <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFormat('csv')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                format === 'csv'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Spreadsheet (.csv)</span>
            </button>
            <button
              onClick={() => setFormat('txt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                format === 'txt'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Text Report (.txt)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Content</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {format.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* Preview Container */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-950/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>File: {fileName}</span>
            <span>{activeContent.length} bytes</span>
          </div>
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre leading-relaxed select-all">
            {activeContent}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Export includes live calculation breakdown and total investments.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
