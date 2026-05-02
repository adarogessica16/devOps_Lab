import { useEffect, useState } from 'react';
import type { DailyTotal, MonthlyTotal } from '../types/expense.types';
import { api } from '../services/api';

interface Props {
  refreshKey: number;
}

export function TotalsDisplay({ refreshKey }: Props) {
  const [daily, setDaily] = useState<DailyTotal[]>([]);
  const [monthly, setMonthly] = useState<MonthlyTotal[]>([]);
  const [tab, setTab] = useState<'daily' | 'monthly'>('monthly');
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisYear = new Date().getFullYear().toString();

  useEffect(() => {
    api.getDailyTotals(thisMonth).then(r => setDaily(r.data ?? []));
    api.getMonthlyTotals(thisYear).then(r => setMonthly(r.data ?? []));
  }, [refreshKey, thisMonth, thisYear]);

  const yearTotal = monthly.reduce((s, m) => s + m.total, 0);
  const thisMonthData = monthly.find(m => m.month === thisMonth);

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-emerald-100 p-2 rounded-lg">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="font-bold text-slate-800 text-lg">Resumen</h2>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-brand-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-brand-500 uppercase tracking-wide">Este mes</p>
          <p className="text-2xl font-extrabold text-brand-700 mt-1">
            ₲{(thisMonthData?.total ?? 0).toLocaleString('es-PY')}
          </p>
          <p className="text-xs text-brand-400 mt-0.5">{thisMonthData?.count ?? 0} gastos</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">Año {thisYear}</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">
            ₲{yearTotal.toLocaleString('es-PY')}
          </p>
          <p className="text-xs text-emerald-400 mt-0.5">
            {monthly.reduce((s, m) => s + m.count, 0)} gastos totales
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-lg p-1 mb-3">
        <button
          onClick={() => setTab('monthly')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
            tab === 'monthly'
              ? 'bg-white text-brand-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Por mes
        </button>
        <button
          onClick={() => setTab('daily')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
            tab === 'daily'
              ? 'bg-white text-brand-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Por día ({thisMonth})
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {tab === 'monthly' ? 'Mes' : 'Día'}
              </th>
              <th className="text-center px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">N°</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Total</th>
            </tr>
          </thead>
          <tbody>
            {(tab === 'monthly' ? monthly : daily).length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-slate-400 py-6 text-xs">
                  Sin datos para mostrar
                </td>
              </tr>
            ) : (tab === 'monthly' ? monthly : daily).map((row, i) => {
              const key = 'month' in row ? row.month : row.date;
              const isEven = i % 2 === 0;
              return (
                <tr key={key} className={isEven ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="px-3 py-2.5 text-slate-600 font-medium">{key}</td>
                  <td className="px-3 py-2.5 text-center text-slate-400">{row.count}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-brand-600">
                    ₲{row.total.toLocaleString('es-PY')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
