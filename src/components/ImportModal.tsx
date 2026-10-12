import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { parseImportFile } from '../utils/fileExport';
import { StockPriceDictionary } from '../types/portfolio';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceDict: StockPriceDictionary;
  onImportHoldings: (items: { symbol: string; quantity: number }[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  priceDict,
  onImportHoldings,
}) => {
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read file. Please try pasting the content directly.');
    };
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    if (!inputText.trim()) {
      setError('Please select a file or paste content first.');
      return;
    }

    const items = parseImportFile(inputText);
    if (items.length === 0) {
      setError(
        'Could not find valid stock holdings in the file. Ensure lines are formatted as "SYMBOL, QUANTITY" or standard exported CSV/TXT.'
      );
      return;
    }

    onImportHoldings(items);
    onClose();
  };

  const sampleCsvSnippet = `AAPL,Apple Inc.,15,180.00,2700.00,45.0%
TSLA,Tesla Inc.,10,250.00,2500.00,40.0%
NVDA,NVIDIA Corp,20,120.00,2400.00,35.0%`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Import Portfolio File</h2>
              <p className="text-xs text-slate-400">
                Load holdings from an exported .csv or .txt file
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

        <div className="p-5 space-y-4">
          {/* File Upload Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-teal-500/60 rounded-xl p-6 text-center cursor-pointer transition bg-slate-950/40 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.txt"
              className="hidden"
            />
            <div className="h-10 w-10 mx-auto rounded-full bg-slate-800 text-teal-400 flex items-center justify-center group-hover:scale-110 transition mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-sm font-medium text-slate-200">
              {fileName ? (
                <span className="text-teal-400 font-mono">{fileName} loaded</span>
              ) : (
                'Choose a .csv or .txt file'
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Supports exported files or simple CSV (SYMBOL, QUANTITY)
            </p>
          </div>

          {/* Paste Raw Text Option */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Or paste raw file contents:</span>
              <button
                type="button"
                onClick={() => setInputText(sampleCsvSnippet)}
                className="text-teal-400 hover:underline"
              >
                Insert sample text
              </button>
            </div>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setError(null);
              }}
              placeholder="e.g.&#10;AAPL, 15&#10;TSLA, 10&#10;NVDA, 20"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
            />
          </div>

          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleProcessImport}
            disabled={!inputText.trim()}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition disabled:opacity-40"
          >
            Import Holdings
          </button>
        </div>
      </div>
    </div>
  );
};
