import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Plus,
  Trash2,
  Save,
  Filter,
  CheckCircle2,
  Printer,
  Copy,
  Calculator
} from 'lucide-react';

export interface SpreadsheetColumn {
  key: string;
  label: string;
  width?: string;
  type?: 'text' | 'number' | 'currency_zmw' | 'status' | 'formula';
}

export interface SpreadsheetRow {
  id: string;
  cells: Record<string, string | number>;
}

interface OfficeSpreadsheetEngineProps {
  sheetTitle: string;
  sheetSubtitle: string;
  officeBadge: string;
  columns: SpreadsheetColumn[];
  initialRows: SpreadsheetRow[];
  storageKey: string;
  sumColumnKeys?: string[];
  onSaveNotice?: (msg: string) => void;
}

export const OfficeSpreadsheetEngine: React.FC<OfficeSpreadsheetEngineProps> = ({
  sheetTitle,
  sheetSubtitle,
  officeBadge,
  columns,
  initialRows,
  storageKey,
  sumColumnKeys = [],
  onSaveNotice
}) => {
  const [rows, setRows] = useState<SpreadsheetRow[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as SpreadsheetRow[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialRows;
  });

  const [selectedCell, setSelectedCell] = useState<{ rowIdx: number; colKey: string } | null>({
    rowIdx: 0,
    colKey: columns[0]?.key || ''
  });
  const [filterText, setFilterText] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<string>('Auto-saved to Cloud Record');

  const persistRows = (nextRows: SpreadsheetRow[]) => {
    setRows(nextRows);
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextRows));
      setLastSavedAt(`Saved ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
    } catch {
      // ignore
    }
  };

  const handleCellChange = (rowId: string, colKey: string, rawVal: string, colType?: string) => {
    const updated = rows.map((r) => {
      if (r.id !== rowId) return r;
      const val =
        colType === 'number' || colType === 'currency_zmw'
          ? rawVal === ''
            ? 0
            : Number(rawVal)
          : rawVal;
      return {
        ...r,
        cells: {
          ...r.cells,
          [colKey]: val
        }
      };
    });
    persistRows(updated);
  };

  const handleAddRow = () => {
    const emptyCells: Record<string, string | number> = {};
    columns.forEach((c, idx) => {
      if (idx === 0) {
        emptyCells[c.key] = `REC-${Math.floor(1000 + Math.random() * 9000)}`;
      } else if (c.type === 'number' || c.type === 'currency_zmw') {
        emptyCells[c.key] = 0;
      } else if (c.type === 'status') {
        emptyCells[c.key] = 'Verified';
      } else {
        emptyCells[c.key] = '';
      }
    });

    const newRow: SpreadsheetRow = {
      id: `row_${Date.now()}`,
      cells: emptyCells
    };
    const next = [...rows, newRow];
    persistRows(next);
    onSaveNotice?.(`Added new record row to ${sheetTitle}.`);
  };

  const handleDeleteRow = (rowId: string) => {
    const next = rows.filter((r) => r.id !== rowId);
    persistRows(next);
    onSaveNotice?.('Record row removed from sheet.');
  };

  const handleExportCSV = () => {
    const headerLine = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',');
    const bodyLines = rows.map((r) =>
      columns
        .map((c) => {
          const val = r.cells[c.key] ?? '';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = [headerLine, ...bodyLines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sheetTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_mride_records.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onSaveNotice?.(`Exported "${sheetTitle}" to Excel / Google Sheets (.CSV)!`);
  };

  const handleCopyTSVForGoogleSheets = () => {
    const headerLine = columns.map((c) => c.label).join('\t');
    const bodyLines = rows.map((r) => columns.map((c) => String(r.cells[c.key] ?? '')).join('\t'));
    const tsv = [headerLine, ...bodyLines].join('\n');
    navigator.clipboard?.writeText(tsv);
    onSaveNotice?.('Copied table! You can paste (Ctrl+V) directly into Google Sheets or Microsoft Excel.');
  };

  const filteredRows = rows.filter((r) => {
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return Object.values(r.cells).some((v) => String(v).toLowerCase().includes(q));
  });

  const activeCellValue =
    selectedCell && filteredRows[selectedCell.rowIdx]
      ? filteredRows[selectedCell.rowIdx].cells[selectedCell.colKey] ?? ''
      : '';

  const colLetter = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden text-xs">
      {/* Top Google Sheets / Excel Green & Dark Header Bar */}
      <div className="bg-[#0F4C29] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">{sheetTitle}</span>
              <span className="bg-emerald-500/30 border border-emerald-300/40 text-emerald-100 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {officeBadge}
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80">{sheetSubtitle}</p>
          </div>
        </div>

        {/* Spreadsheet Action Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-emerald-200 font-mono mr-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {lastSavedAt}
          </span>
          <button
            type="button"
            onClick={handleAddRow}
            className="rounded-lg bg-white text-[#0F4C29] hover:bg-emerald-50 font-extrabold px-2.5 py-1.5 text-[11px] flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" /> + New Record Row
          </button>
          <button
            type="button"
            onClick={handleCopyTSVForGoogleSheets}
            className="rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-2.5 py-1.5 text-[11px] flex items-center gap-1 border border-emerald-500/40"
            title="Copy all cells to paste directly into Google Sheets"
          >
            <Copy className="w-3.5 h-3.5" /> Copy for Google Sheets
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="rounded-lg bg-[#FF6500] hover:bg-[#e55a00] text-white font-extrabold px-3 py-1.5 text-[11px] flex items-center gap-1 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" /> Export Excel (.CSV)
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-white font-bold p-1.5"
            title="Print Official Office Ledger"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Excel Formula Bar (`fx`) & Filter Bar */}
      <div className="bg-[#F8FAFC] border-b border-slate-300 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <span className="px-2 py-1 rounded bg-white border border-slate-300 font-mono font-extrabold text-[11px] text-slate-700 min-w-[48px] text-center">
            {selectedCell
              ? `${colLetter(
                  Math.max(
                    0,
                    columns.findIndex((c) => c.key === selectedCell.colKey)
                  )
                )}${selectedCell.rowIdx + 1}`
              : 'A1'}
          </span>
          <span className="font-serif italic font-black text-slate-400 px-1">fx</span>
          <input
            type="text"
            value={String(activeCellValue)}
            onChange={(e) => {
              if (!selectedCell) return;
              const targetRow = filteredRows[selectedCell.rowIdx];
              const targetCol = columns.find((c) => c.key === selectedCell.colKey);
              if (targetRow && targetCol) {
                handleCellChange(targetRow.id, targetCol.key, e.target.value, targetCol.type);
              }
            }}
            placeholder="Select any cell below to edit record value..."
            className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-mono text-xs text-[#15191C] focus:outline-none focus:border-[#0F4C29]"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter sheet rows..."
              className="bg-white border border-slate-300 rounded-lg pl-8 pr-2.5 py-1 text-xs text-[#15191C] w-48"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              persistRows(rows);
              onSaveNotice?.(`All ${rows.length} rows committed to Mride Master Database.`);
            }}
            className="rounded-lg bg-slate-900 text-white font-bold px-2.5 py-1 text-[11px] flex items-center gap-1"
          >
            <Save className="w-3 h-3" /> Save Sheet
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid Table */}
      <div className="overflow-x-auto max-h-[420px]">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10">
            {/* Column Letter Row (A, B, C, D...) */}
            <tr className="bg-slate-200 text-slate-600 text-[10px] font-mono border-b border-slate-300">
              <th className="w-10 py-1 px-2 text-center border-r border-slate-300">#</th>
              {columns.map((col, idx) => (
                <th
                  key={col.key}
                  className="py-1 px-2.5 text-center border-r border-slate-300 font-bold"
                >
                  {colLetter(idx)}
                </th>
              ))}
              <th className="w-10 py-1 px-2 text-center">Del</th>
            </tr>
            {/* Column Title Header Row */}
            <tr className="bg-[#EEF2F6] text-[#15191C] border-b-2 border-slate-300">
              <th className="py-2 px-2 text-center border-r border-slate-300 font-mono text-[10px] text-slate-500">
                Row
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="py-2 px-2.5 border-r border-slate-300 font-extrabold text-[11px] whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
              <th className="py-2 px-2 text-center font-bold text-[10px] text-slate-500">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {filteredRows.map((row, rIdx) => (
              <tr key={row.id} className="hover:bg-emerald-50/40 group">
                {/* Row Number */}
                <td className="bg-slate-100 text-slate-500 font-mono text-[10px] text-center py-1.5 px-2 border-r border-slate-300 font-bold">
                  {rIdx + 1}
                </td>

                {/* Editable Cells */}
                {columns.map((col) => {
                  const isSelected =
                    selectedCell?.rowIdx === rIdx && selectedCell?.colKey === col.key;
                  const cellVal = row.cells[col.key] ?? '';

                  return (
                    <td
                      key={col.key}
                      onClick={() => setSelectedCell({ rowIdx: rIdx, colKey: col.key })}
                      className={`p-0 border-r border-slate-200 transition-colors ${
                        isSelected ? 'ring-2 ring-inset ring-[#0F4C29] bg-emerald-50/50' : ''
                      }`}
                    >
                      <input
                        type={col.type === 'number' || col.type === 'currency_zmw' ? 'number' : 'text'}
                        value={String(cellVal)}
                        onChange={(e) =>
                          handleCellChange(row.id, col.key, e.target.value, col.type)
                        }
                        className={`w-full px-2.5 py-1.5 bg-transparent focus:outline-none text-xs ${
                          col.type === 'currency_zmw'
                            ? 'font-mono font-extrabold text-emerald-800 text-right'
                            : col.type === 'number'
                            ? 'font-mono font-bold text-slate-800 text-right'
                            : col.type === 'status'
                            ? 'font-extrabold text-[#FF6500]'
                            : 'font-medium text-[#15191C]'
                        }`}
                      />
                    </td>
                  );
                })}

                <td className="py-1 px-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(row.id)}
                    className="text-slate-300 hover:text-red-600 p-1"
                    title="Delete Row"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

          {/* Automatic Bottom Summary / Formula Row (`SUM` / `COUNT`) */}
          {sumColumnKeys.length > 0 && (
            <tfoot>
              <tr className="bg-[#E6F4EA] border-t-2 border-[#0F4C29] font-extrabold text-[#0F4C29]">
                <td className="py-2 px-2 text-center border-r border-emerald-300 font-mono text-[10px]">
                  <Calculator className="w-3.5 h-3.5 mx-auto" />
                </td>
                {columns.map((col, idx) => {
                  if (idx === 0) {
                    return (
                      <td
                        key={col.key}
                        className="py-2 px-2.5 border-r border-emerald-300 font-extrabold text-[11px]"
                      >
                        TOTAL / SUMMARY ({filteredRows.length} records)
                      </td>
                    );
                  }
                  if (sumColumnKeys.includes(col.key)) {
                    const total = filteredRows.reduce(
                      (acc, r) => acc + (Number(r.cells[col.key]) || 0),
                      0
                    );
                    return (
                      <td
                        key={col.key}
                        className="py-2 px-2.5 border-r border-emerald-300 font-mono font-black text-right text-xs"
                      >
                        {col.type === 'currency_zmw'
                          ? `K${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : total.toLocaleString()}
                      </td>
                    );
                  }
                  return (
                    <td key={col.key} className="py-2 px-2.5 border-r border-emerald-300 text-slate-400">
                      —
                    </td>
                  );
                })}
                <td className="py-2 px-2" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
