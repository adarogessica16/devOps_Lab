export interface Expense {
  id: number;
  amount: number;
  category: string;
  date: string;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDto {
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> {}

export interface ExpenseFilter {
  day?: string;
  month?: string;
  category?: string;
}

export interface DailyTotal {
  date: string;
  total: number;
  count: number;
}

export interface MonthlyTotal {
  month: string;
  total: number;
  count: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
}
