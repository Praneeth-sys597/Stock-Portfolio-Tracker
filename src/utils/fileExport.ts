import { StockHolding, StockPriceDictionary, CurrencyConfig } from '../types/portfolio';

export function formatCurrency(amount: number, currency: CurrencyConfig): string {
  const converted = amount * currency.rate;
  return `${currency.symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function calculatePositionValue(holding: StockHolding, priceDict: StockPriceDictionary): {
  unitPrice: number;
  totalValue: number;
} {
  const stockInfo = priceDict[holding.symbol.toUpperCase()];
  const unitPrice = stockInfo ? stockInfo.price : 0;
  const totalValue = holding.quantity * unitPrice;
  return { unitPrice, totalValue };
}

export function calculatePortfolioTotals(
  holdings: StockHolding[],
  priceDict: StockPriceDictionary
) {
  let totalInvestment = 0;
  let totalShares = 0;

  const positions = holdings.map((holding) => {
    const { unitPrice, totalValue } = calculatePositionValue(holding, priceDict);
    totalInvestment += totalValue;
    totalShares += holding.quantity;
    return {
      ...holding,
      unitPrice,
      totalValue,
    };
  });

  const positionsWithWeight = positions.map((p) => ({
    ...p,
    weight: totalInvestment > 0 ? (p.totalValue / totalInvestment) * 100 : 0,
  }));

  // Sort descending by value
  positionsWithWeight.sort((a, b) => b.totalValue - a.totalValue);

  return {
    totalInvestment,
    totalShares,
    positions: positionsWithWeight,
    topHolding: positionsWithWeight[0] || null,
  };
}

export function generateCSV(
  holdings: StockHolding[],
  priceDict: StockPriceDictionary,
  currency: CurrencyConfig
): string {
  const { totalInvestment, totalShares, positions } = calculatePortfolioTotals(holdings, priceDict);
  const now = new Date().toISOString();

  const lines: string[] = [
    `# Stock Portfolio Tracker - Export Report`,
    `# Export Date: ${now}`,
    `# Currency: ${currency.code} (${currency.symbol})`,
    `Symbol,Company Name,Quantity,Price Per Share (${currency.code}),Total Investment (${currency.code}),Allocation (%)`,
  ];

  for (const pos of positions) {
    const sym = pos.symbol.toUpperCase();
    const name = `"${pos.name.replace(/"/g, '""')}"`;
    const qty = pos.quantity;
    const price = (pos.unitPrice * currency.rate).toFixed(2);
    const totalVal = (pos.totalValue * currency.rate).toFixed(2);
    const weight = pos.weight.toFixed(2);
    lines.push(`${sym},${name},${qty},${price},${totalVal},${weight}%`);
  }

  lines.push('');
  lines.push(`TOTAL,All Holdings,${totalShares},N/A,${(totalInvestment * currency.rate).toFixed(2)},100.00%`);

  return lines.join('\n');
}

export function generateTXT(
  holdings: StockHolding[],
  priceDict: StockPriceDictionary,
  currency: CurrencyConfig
): string {
  const { totalInvestment, totalShares, positions } = calculatePortfolioTotals(holdings, priceDict);
  const dateStr = new Date().toLocaleString();

  const divider = '='.repeat(68);
  const thinDivider = '-'.repeat(68);

  const lines: string[] = [
    divider,
    '               STOCK PORTFOLIO TRACKER REPORT',
    divider,
    `Generated On   : ${dateStr}`,
    `Currency       : ${currency.code} (${currency.symbol})`,
    `Total Holdings : ${holdings.length} stocks`,
    `Total Quantity : ${totalShares} shares`,
    thinDivider,
    'INVESTMENT BREAKDOWN:',
    'Formula: Quantity × Price Per Share = Total Investment',
    thinDivider,
    ` ${'SYMBOL'.padEnd(8)} | ${'QTY'.padStart(6)} | ${'PRICE'.padStart(10)} | ${'TOTAL VALUE'.padStart(13)} | ${'WEIGHT'.padStart(8)}`,
    thinDivider,
  ];

  for (const pos of positions) {
    const sym = pos.symbol.toUpperCase().padEnd(8);
    const qty = pos.quantity.toString().padStart(6);
    const priceFormatted = formatCurrency(pos.unitPrice, currency).padStart(10);
    const totalFormatted = formatCurrency(pos.totalValue, currency).padStart(13);
    const weight = `${pos.weight.toFixed(1)}%`.padStart(8);

    lines.push(` ${sym} | ${qty} | ${priceFormatted} | ${totalFormatted} | ${weight}`);
    lines.push(`   (${pos.name})`);
  }

  lines.push(thinDivider);
  lines.push(` TOTAL INVESTMENT VALUE : ${formatCurrency(totalInvestment, currency)}`);
  lines.push(` TOTAL SHARES HELD      : ${totalShares} units`);
  lines.push(divider);
  lines.push('PRICE DICTIONARY REFERENCE:');
  for (const [sym, info] of Object.entries(priceDict)) {
    lines.push(`  • ${sym.padEnd(6)}: ${formatCurrency(info.price, currency)} (${info.name})`);
  }
  lines.push(divider);

  return lines.join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function parseImportFile(
  text: string
): { symbol: string; quantity: number }[] {
  const results: { symbol: string; quantity: number }[] = [];
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.toUpperCase().startsWith('TOTAL')) {
      continue;
    }

    // Check if CSV format: SYMBOL,NAME,QTY,... or SYMBOL,QTY
    if (trimmed.includes(',')) {
      const parts = trimmed.split(',').map((p) => p.replace(/"/g, '').trim());
      // First part might be symbol
      const potentialSymbol = parts[0]?.toUpperCase();
      if (potentialSymbol && /^[A-Z0-9_\.]{1,10}$/.test(potentialSymbol)) {
        // Find quantity part: usually 2nd or 3rd column
        let qty = 0;
        if (parts.length >= 3 && !isNaN(Number(parts[2]))) {
          qty = Number(parts[2]);
        } else if (parts.length >= 2 && !isNaN(Number(parts[1]))) {
          qty = Number(parts[1]);
        }
        if (qty > 0) {
          results.push({ symbol: potentialSymbol, quantity: qty });
        }
      }
    } else if (trimmed.includes('|')) {
      // Might be TXT ASCII table row: AAPL | 15 | ...
      const parts = trimmed.split('|').map((p) => p.trim());
      const potentialSymbol = parts[0]?.toUpperCase();
      const potentialQty = Number(parts[1]);
      if (
        potentialSymbol &&
        /^[A-Z0-9_\.]{1,10}$/.test(potentialSymbol) &&
        !isNaN(potentialQty) &&
        potentialQty > 0
      ) {
        results.push({ symbol: potentialSymbol, quantity: potentialQty });
      }
    }
  }

  return results;
}
