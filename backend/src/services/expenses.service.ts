import { prisma } from '../lib/prisma';
import type { CreateExpenseDto, UpdateExpenseDto, ExpenseFilterDto, DailyTotal, MonthlyTotal } from '../types/expense.types';

export const ExpensesService = {
  async create(data: CreateExpenseDto) {
    return prisma.expense.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
    });
  },

  async findAll(filters: ExpenseFilterDto) {
    const where: Record<string, unknown> = {};

    if (filters.day) {
      const start = new Date(`${filters.day}T00:00:00.000Z`);
      const end = new Date(`${filters.day}T23:59:59.999Z`);
      where.date = { gte: start, lte: end };
    } else if (filters.month) {
      const [year, month] = filters.month.split('-').map(Number);
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
      where.date = { gte: start, lte: end };
    }

    if (filters.category) {
      where.category = { contains: filters.category, mode: 'insensitive' };
    }

    return prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  },

  async findById(id: number) {
    return prisma.expense.findUnique({ where: { id } });
  },

  async update(id: number, data: UpdateExpenseDto) {
    return prisma.expense.update({
      where: { id },
      data: {
        ...data,
        ...(data.date ? { date: new Date(data.date) } : {}),
      },
    });
  },

  async remove(id: number) {
    return prisma.expense.delete({ where: { id } });
  },

  async getDailyTotals(month?: string): Promise<DailyTotal[]> {
    const where: Record<string, unknown> = {};
    if (month) {
      const [year, m] = month.split('-').map(Number);
      where.date = {
        gte: new Date(Date.UTC(year, m - 1, 1)),
        lte: new Date(Date.UTC(year, m, 0, 23, 59, 59, 999)),
      };
    }

    const expenses = await prisma.expense.findMany({ where, orderBy: { date: 'asc' } });

    const grouped: Record<string, { total: number; count: number }> = {};
    for (const e of expenses) {
      const key = e.date.toISOString().slice(0, 10);
      if (!grouped[key]) grouped[key] = { total: 0, count: 0 };
      grouped[key].total += e.amount;
      grouped[key].count += 1;
    }

    return Object.entries(grouped).map(([date, v]) => ({
      date,
      total: Math.round(v.total * 100) / 100,
      count: v.count,
    }));
  },

  async getMonthlyTotals(year?: string): Promise<MonthlyTotal[]> {
    const where: Record<string, unknown> = {};
    if (year) {
      where.date = {
        gte: new Date(Date.UTC(Number(year), 0, 1)),
        lte: new Date(Date.UTC(Number(year), 11, 31, 23, 59, 59, 999)),
      };
    }

    const expenses = await prisma.expense.findMany({ where, orderBy: { date: 'asc' } });

    const grouped: Record<string, { total: number; count: number }> = {};
    for (const e of expenses) {
      const key = e.date.toISOString().slice(0, 7);
      if (!grouped[key]) grouped[key] = { total: 0, count: 0 };
      grouped[key].total += e.amount;
      grouped[key].count += 1;
    }

    return Object.entries(grouped).map(([month, v]) => ({
      month,
      total: Math.round(v.total * 100) / 100,
      count: v.count,
    }));
  },
};
