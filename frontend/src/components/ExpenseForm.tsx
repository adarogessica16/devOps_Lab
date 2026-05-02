import { useState } from 'react';
import type { CreateExpenseDto, Expense, UpdateExpenseDto } from '../types/expense.types';

const CATEGORIES = [
  'Alimentación', 'Transporte', 'Salud', 'Entretenimiento',
  'Educación', 'Ropa', 'Hogar', 'Servicios', 'Otros',
];

interface Props {
  onSubmit: (data: CreateExpenseDto) => Promise<void>;
  initialData?: Expense;
  onCancel?: () => void;
}

export function ExpenseForm({ onSubmit, initialData, onCancel }: Props) {
  const [form, setForm] = useState<CreateExpenseDto>({
    amount: initialData?.amount ?? 0,
    category: initialData?.category ?? CATEGORIES[0],
    date: initialData?.date
      ? new Date(initialData.date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    note: initialData?.note ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.amount <= 0) return setError('El monto debe ser mayor a 0');
    setLoading(true);
    try {
      const payload: UpdateExpenseDto = {
        ...form,
        date: new Date(form.date).toISOString(),
        note: form.note || undefined,
      };
      await onSubmit(payload as CreateExpenseDto);
      if (!initialData) {
        setForm({ amount: 0, category: CATEGORIES[0], date: new Date().toISOString().slice(0, 16), note: '' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!initialData;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="bg-brand-100 p-2 rounded-lg">
          <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={isEditing
                ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                : "M12 4v16m8-8H4"} />
          </svg>
        </div>
        <h2 className="font-bold text-slate-800 text-lg">
          {isEditing ? 'Editar gasto' : 'Nuevo gasto'}
        </h2>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm mb-4">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Amount */}
        <div>
          <label className="label">Monto (₲)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">₲</span>
            <input
              className="input-base pl-7"
              type="number"
              name="amount"
              value={form.amount || ''}
              onChange={handleChange}
              placeholder="0"
              min="1"
              step="1"
              required
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="label">Categoría</label>
          <select className="input-base" name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="label">Fecha y hora</label>
          <input
            className="input-base"
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        {/* Note */}
        <div>
          <label className="label">Nota <span className="normal-case text-slate-400 font-normal">(opcional)</span></label>
          <textarea
            className="input-base resize-none"
            rows={2}
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Descripción del gasto..."
            maxLength={500}
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Guardando...
              </>
            ) : isEditing ? 'Actualizar' : 'Agregar gasto'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
