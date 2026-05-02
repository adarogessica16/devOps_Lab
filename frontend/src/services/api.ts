import type {
  Expense,
  CreateExpenseDto,
  UpdateExpenseDto,
  ExpenseFilter,
  DailyTotal,
  MonthlyTotal,
  ApiResponse,
} from '../types/expense.types';

const BASE_URL = '/api/expenses';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Error en la solicitud');
  return json as T;
}

export const api = {
  createExpense(data: CreateExpenseDto) {
    return request<ApiResponse<Expense>>(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getExpenses(filters: ExpenseFilter = {}) {
    const params = new URLSearchParams();
    if (filters.day) params.set('day', filters.day);
    if (filters.month) params.set('month', filters.month);
    if (filters.category) params.set('category', filters.category);
    const query = params.toString();
    return request<ApiResponse<Expense[]>>(`${BASE_URL}${query ? `?${query}` : ''}`);
  },

  getExpenseById(id: number) {
    return request<ApiResponse<Expense>>(`${BASE_URL}/${id}`);
  },

  updateExpense(id: number, data: UpdateExpenseDto) {
    return request<ApiResponse<Expense>>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteExpense(id: number) {
    return request<ApiResponse<null>>(`${BASE_URL}/${id}`, { method: 'DELETE' });
  },

  getDailyTotals(month?: string) {
    const query = month ? `?month=${month}` : '';
    return request<ApiResponse<DailyTotal[]>>(`${BASE_URL}/totals/daily${query}`);
  },

  getMonthlyTotals(year?: string) {
    const query = year ? `?year=${year}` : '';
    return request<ApiResponse<MonthlyTotal[]>>(`${BASE_URL}/totals/monthly${query}`);
  },
};
