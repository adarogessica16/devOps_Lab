import { z } from 'zod';

export const CreateExpenseSchema = z.object({
  amount: z.number().positive({ message: 'El monto debe ser positivo' }),
  category: z.string().min(1, { message: 'La categoría es requerida' }).max(100),
  date: z.string().datetime({ message: 'Fecha inválida, usa formato ISO 8601' }),
  note: z.string().max(500).optional(),
});

export const UpdateExpenseSchema = CreateExpenseSchema.partial();

export const ExpenseFilterSchema = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de día: YYYY-MM-DD').optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Formato de mes: YYYY-MM').optional(),
  category: z.string().optional(),
});

export type CreateExpenseDto = z.infer<typeof CreateExpenseSchema>;
export type UpdateExpenseDto = z.infer<typeof UpdateExpenseSchema>;
export type ExpenseFilterDto = z.infer<typeof ExpenseFilterSchema>;

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
  message?: string;
  errors?: string[];
}
