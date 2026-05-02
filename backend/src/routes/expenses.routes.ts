import { Router } from 'express';
import { ExpensesController } from '../controllers/expenses.controller';

export const expenseRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Gestión de gastos
 */

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Crear un nuevo gasto
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExpense'
 *     responses:
 *       201:
 *         description: Gasto creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
expenseRouter.post('/', ExpensesController.create);

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Listar todos los gastos (con filtros opcionales)
 *     tags: [Expenses]
 *     parameters:
 *       - in: query
 *         name: day
 *         schema:
 *           type: string
 *           example: "2024-06-15"
 *         description: Filtrar por día (YYYY-MM-DD)
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           example: "2024-06"
 *         description: Filtrar por mes (YYYY-MM)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría (búsqueda parcial)
 *     responses:
 *       200:
 *         description: Lista de gastos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseListResponse'
 */
expenseRouter.get('/', ExpensesController.findAll);

/**
 * @swagger
 * /api/expenses/totals/daily:
 *   get:
 *     summary: Totales agrupados por día
 *     tags: [Expenses]
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           example: "2024-06"
 *         description: Filtrar por mes (YYYY-MM)
 *     responses:
 *       200:
 *         description: Totales diarios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DailyTotalsResponse'
 */
expenseRouter.get('/totals/daily', ExpensesController.getDailyTotals);

/**
 * @swagger
 * /api/expenses/totals/monthly:
 *   get:
 *     summary: Totales agrupados por mes
 *     tags: [Expenses]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *           example: "2024"
 *         description: Filtrar por año
 *     responses:
 *       200:
 *         description: Totales mensuales
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MonthlyTotalsResponse'
 */
expenseRouter.get('/totals/monthly', ExpensesController.getMonthlyTotals);

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Obtener un gasto por ID
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gasto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
expenseRouter.get('/:id', ExpensesController.findById);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Actualizar un gasto
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateExpense'
 *     responses:
 *       200:
 *         description: Gasto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
expenseRouter.put('/:id', ExpensesController.update);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Eliminar un gasto
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gasto eliminado
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
expenseRouter.delete('/:id', ExpensesController.remove);
