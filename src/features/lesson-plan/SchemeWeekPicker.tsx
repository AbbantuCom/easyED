'use client';

import { useMemo, useState } from 'react';
import { useSchemeWeekOptions } from '@/hooks/useSchemes';
import type { SchemeWeekOption } from '@/services/schemeService';

export function SchemeWeekPicker({
  onSelect,
}: {
  onSelect: (option: SchemeWeekOption) => void;
}) {
  const { data, isLoading } = useSchemeWeekOptions();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const options = useMemo(() => data?.options ?? [], [data]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((option) => formatOption(option).toLowerCase().includes(q));
  }, [options, query]);

  function formatOption(option: SchemeWeekOption): string {
    return `${option.klass} ${option.subject} — Week ${option.week}: ${option.topic}`;
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading scheme weeks…</p>;
  }

  if (options.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No scheme weeks available yet. Create a scheme book first to pull from it.
      </p>
    );
  }

  return (
    <div className="relative">
      <label htmlFor="scheme-week-picker" className="text-sm font-medium text-slate-700">
        Pull from scheme week
      </label>
      <input
        id="scheme-week-picker"
        type="text"
        placeholder="Search by class, subject, or topic…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      />
      {open && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-500">No matching weeks</li>
          )}
          {filtered.map((option) => (
            <li key={option.weekId}>
              <button
                type="button"
                onClick={() => {
                  onSelect(option);
                  setQuery(formatOption(option));
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-indigo-50"
              >
                {formatOption(option)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
