import { useState } from 'react';
import type { Expense, CreateExpenseDto } from '../types/expense.types';
import { ExpenseForm } from './ExpenseForm';

const CATEGORY_COLORS: Record<string, string> = {
  Alimentación:    'bg-green-100 text-green-700',
  Transporte:      'bg-blue-100 text-blue-700',
  Salud:           'bg-red-100 text-red-700',
  Entretenimiento: 'bg-purple-100 text-purple-700',
  Educación:       'bg-yellow-100 text-yellow-700',
  Ropa:            'bg-pink-100 text-pink-700',
  Hogar:           'bg-orange-100 text-orange-700',
  Servicios:       'bg-cyan-100 text-cyan-700',
  Otros:           'bg-slate-100 text-slate-700',
};


interface Props {
  expenses: Expense[];
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, data: CreateExpenseDto) => Promise<void>;
}

export function ExpenseList({ expenses, onDelete, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);

  if (expenses.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-slate-400">
        <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="font-semibold text-slate-500">No hay gastos para mostrar</p>
        <p className="text-sm mt-1">Prueba ajustando los filtros o agrega un nuevo gasto</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {expenses.map(exp => (
        <div key={exp.id} className="card overflow-hidden">
          {editingId === exp.id ? (
            <div className="p-2">
              <ExpenseForm
                initialData={exp}
                onSubmit={async data => { await onUpdate(exp.id, data); setEditingId(null); }}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div className="flex items-center gap-4 px-5 py-4">
              {/* Emoji icon */}
              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[exp.category] ?? 'bg-slate-100 text-slate-700'}`}>
                    {exp.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(exp.date).toLocaleDateString('es-AR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                {exp.note && (
                  <p className="text-sm text-slate-500 mt-1 truncate">{exp.note}</p>
                )}
              </div>

              {/* Amount + actions */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-xl font-extrabold text-brand-600">
                  ₲{exp.amount.toLocaleString('es-PY')}
                </span>
                <div className="flex gap-2">
                  <button className="btn-ghost" onClick={() => setEditingId(exp.id)}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => onDelete(exp.id)}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
