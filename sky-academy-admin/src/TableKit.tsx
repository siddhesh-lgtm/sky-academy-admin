import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Search, X } from 'lucide-react';
import { FancySelect } from './ui';

export type SmartRow = {
  id: string;
  searchText: string;
  filterValues?: Record<string, string>;
  sortValues?: Record<string, string | number>;
  cells: React.ReactNode[];
  exportCells: (string | number)[];
};

export type SmartFilter = {
  key: string;
  label: string;
  options: string[];
};

function downloadCsv(heads: string[], data: (string | number)[][], file: string) {
  const csv = [heads, ...data]
    .map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const u = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = u;
  a.download = file;
  a.click();
  URL.revokeObjectURL(u);
}

function cmp(a: string | number, b: string | number) {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

export function useSmartRows(rows: SmartRow[], filters: SmartFilter[], defaultSortKey?: string) {
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<Record<string, string>>(() =>
    Object.fromEntries(filters.map((f) => [f.key, 'All'])),
  );
  const [sortKey, setSortKey] = useState(defaultSortKey || '');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let next = rows.filter((r) => {
      if (q && !r.searchText.toLowerCase().includes(q)) return false;
      for (const f of filters) {
        const selected = filterState[f.key] || 'All';
        if (selected !== 'All' && (r.filterValues?.[f.key] || '') !== selected) return false;
      }
      return true;
    });
    if (sortKey) {
      next = [...next].sort((a, b) => {
        const av = a.sortValues?.[sortKey] ?? '';
        const bv = b.sortValues?.[sortKey] ?? '';
        const d = cmp(av, bv);
        return sortDir === 'asc' ? d : -d;
      });
    }
    return next;
  }, [rows, search, filterState, filters, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const clear = () => {
    setSearch('');
    setFilterState(Object.fromEntries(filters.map((f) => [f.key, 'All'])));
  };

  const active = !!search.trim() || filters.some((f) => (filterState[f.key] || 'All') !== 'All');

  return {
    search,
    setSearch,
    filterState,
    setFilterState,
    sortKey,
    sortDir,
    toggleSort,
    filtered,
    clear,
    active,
  };
}

export function SmartTable({
  headers,
  rows,
  filters = [],
  sortKeys = {},
  defaultSortKey,
  exportHeaders,
  exportFile,
  emptyText = 'No matching records',
}: {
  headers: string[];
  rows: SmartRow[];
  filters?: SmartFilter[];
  sortKeys?: Record<string, string>;
  defaultSortKey?: string;
  exportHeaders?: string[];
  exportFile?: string;
  emptyText?: string;
}) {
  const ctrl = useSmartRows(rows, filters, defaultSortKey);
  const exportHeads = exportHeaders || headers.filter((h) => h !== 'Actions' && h !== 'Action');

  return (
    <div className="smart-table">
      <div className="table-toolbar">
        <label className="table-search">
          <Search size={15} />
          <input
            value={ctrl.search}
            onChange={(e) => ctrl.setSearch(e.target.value)}
            placeholder="Search this table..."
          />
          {ctrl.search ? (
            <button type="button" className="icon-btn glass-hit" onClick={() => ctrl.setSearch('')} aria-label="Clear search">
              <X size={14} />
            </button>
          ) : null}
        </label>
        <div className="table-filters">
          {filters.map((f) => (
            <label key={f.key} className="table-filter">
              <span>{f.label}</span>
              <FancySelect
                value={ctrl.filterState[f.key] || 'All'}
                options={['All', ...f.options]}
                onChange={(v) => ctrl.setFilterState((s) => ({ ...s, [f.key]: v }))}
                ariaLabel={f.label}
              />
            </label>
          ))}
        </div>
        <div className="table-toolbar-actions">
          <span className="table-count">
            {ctrl.filtered.length}
            {ctrl.active ? ` / ${rows.length}` : ''} shown
          </span>
          {ctrl.active ? (
            <button type="button" className="text-link" onClick={ctrl.clear}>
              Clear
            </button>
          ) : null}
          {exportFile ? (
            <button
              type="button"
              className="btn secondary btn-sm glass-hit"
              onClick={() =>
                downloadCsv(
                  exportHeads,
                  ctrl.filtered.map((r) => r.exportCells),
                  exportFile,
                )
              }
            >
              <Download size={14} /> Export CSV
            </button>
          ) : null}
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {headers.map((h) => {
                const key = sortKeys[h];
                const active = key && ctrl.sortKey === key;
                return (
                  <th key={h}>
                    {key ? (
                      <button type="button" className={'th-sort' + (active ? ' active' : '')} onClick={() => ctrl.toggleSort(key)}>
                        <span>{h}</span>
                        {active ? ctrl.sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} /> : <ArrowUpDown size={13} />}
                      </button>
                    ) : (
                      h
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ctrl.filtered.length ? (
              ctrl.filtered.map((r) => (
                <tr key={r.id}>
                  {r.cells.map((c, j) => (
                    <td key={j}>{c}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="empty">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((r, i) => (
              <tr key={i}>
                {r.map((v, j) => (
                  <td key={j}>{v}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="empty">
                No matching records
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
