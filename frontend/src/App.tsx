import { useCallback, useEffect, useState } from 'react';
import { api } from './services/api';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseFilterBar } from './components/ExpenseFilter';
import { TotalsDisplay } from './components/TotalsDisplay';
import { Toaster } from './components/Toaster';
import { useToast } from './hooks/useToast';
import type { Expense, ExpenseFilter, CreateExpenseDto } from './types/expense.types';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filters, setFilters] = useState<ExpenseFilter>({});
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const { toasts, toast, dismiss } = useToast();

  const refresh = () => setRefreshKey(k => k + 1);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getExpenses(filters);
      setExpenses(res.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar gastos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadExpenses(); }, [loadExpenses, refreshKey]);

  const handleCreate = async (data: CreateExpenseDto) => {
    await api.createExpense(data);
    setShowForm(false);
    refresh();
  };

  const handleUpdate = async (id: number, data: CreateExpenseDto) => {
    await api.updateExpense(id, data);
    refresh();
  };

  const handleDelete = async (id: number) => {
    toast('confirm', '¿Eliminar este gasto?', async () => {
      try {
        await api.deleteExpense(id);
        refresh();
        toast('success', 'Gasto eliminado correctamente');
      } catch {
        toast('error', 'No se pudo eliminar el gasto');
      }
    });
  };

  const totalVisible = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-600 to-brand-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl leading-tight">Registro de Gastos</h1>
              <p className="text-brand-200 text-xs">Gestiona tus finanzas personales</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-white text-brand-600 hover:bg-brand-50 font-bold px-4 py-2 rounded-xl text-sm transition shadow"
          >
            {showForm ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo gasto
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
        {/* Sidebar */}
        <div className="lg:sticky lg:top-8 flex flex-col gap-6">
          {showForm && (
            <ExpenseForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          )}
          <TotalsDisplay refreshKey={refreshKey} />
        </div>

        {/* Main content */}
        <div className="flex flex-col gap-4">
          <ExpenseFilterBar filters={filters} onChange={setFilters} />

          {/* Summary bar */}
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-slate-500">
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Cargando...
                </span>
              ) : (
                <><strong className="text-slate-700">{expenses.length}</strong> gasto{expenses.length !== 1 ? 's' : ''} encontrado{expenses.length !== 1 ? 's' : ''}</>
              )}
            </span>
            {!loading && expenses.length > 0 && (
              <span className="text-sm font-semibold text-slate-700">
                Total filtrado: <span className="text-brand-600">₲{totalVisible.toLocaleString('es-PY')}</span>
              </span>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <ExpenseList expenses={expenses} onDelete={handleDelete} onUpdate={handleUpdate} />
        </div>
      </main>

      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
