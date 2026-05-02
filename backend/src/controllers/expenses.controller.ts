import type { Request, Response, NextFunction } from 'express';
import { ExpensesService } from '../services/expenses.service';
import { CreateExpenseSchema, UpdateExpenseSchema, ExpenseFilterSchema } from '../types/expense.types';
import { AppError } from '../middleware/errorHandler';

export const ExpensesController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = CreateExpenseSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors.map(e => e.message).join(', '), 400);
      }
      const expense = await ExpensesService.create(parsed.data);
      res.status(201).json({ success: true, data: expense });
    } catch (err) {
      next(err);
    }
  },

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = ExpenseFilterSchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors.map(e => e.message).join(', '), 400);
      }
      const expenses = await ExpensesService.findAll(parsed.data);
      res.json({ success: true, data: expenses, count: expenses.length });
    } catch (err) {
      next(err);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) throw new AppError('ID inválido', 400);

      const expense = await ExpensesService.findById(id);
      if (!expense) throw new AppError('Gasto no encontrado', 404);

      res.json({ success: true, data: expense });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) throw new AppError('ID inválido', 400);

      const existing = await ExpensesService.findById(id);
      if (!existing) throw new AppError('Gasto no encontrado', 404);

      const parsed = UpdateExpenseSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors.map(e => e.message).join(', '), 400);
      }

      const updated = await ExpensesService.update(id, parsed.data);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) throw new AppError('ID inválido', 400);

      const existing = await ExpensesService.findById(id);
      if (!existing) throw new AppError('Gasto no encontrado', 404);

      await ExpensesService.remove(id);
      res.json({ success: true, message: 'Gasto eliminado correctamente' });
    } catch (err) {
      next(err);
    }
  },

  async getDailyTotals(req: Request, res: Response, next: NextFunction) {
    try {
      const month = req.query.month as string | undefined;
      const totals = await ExpensesService.getDailyTotals(month);
      res.json({ success: true, data: totals });
    } catch (err) {
      next(err);
    }
  },

  async getMonthlyTotals(req: Request, res: Response, next: NextFunction) {
    try {
      const year = req.query.year as string | undefined;
      const totals = await ExpensesService.getMonthlyTotals(year);
      res.json({ success: true, data: totals });
    } catch (err) {
      next(err);
    }
  },
};
