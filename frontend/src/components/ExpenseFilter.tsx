import type { ExpenseFilter } from '../types/expense.types';

interface Props {
  filters: ExpenseFilter;
  onChange: (filters: ExpenseFilter) => void;
}

export function ExpenseFilterBar({ filters, onChange }: Props) {
  const query = filters.category ?? '';

  const handleChange = (value: string) => {
    onChange({ category: value || undefined });
  };

  return (
    <div className="relative">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      <input
        type="text"
        placeholder="Buscar por categoría o nota..."
        value={query}
        onChange={e => handleChange(e.target.value)}
        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
                   focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                   shadow-sm placeholder-slate-400 transition"
      />

      {query && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          aria-label="Limpiar búsqueda"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
