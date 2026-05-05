import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Registro de Gastos API',
      version: '1.0.0',
      description: 'API REST para gestionar gastos personales',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Servidor de desarrollo' },
    ],
    components: {
      schemas: {
        Expense: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            amount: { type: 'number', example: 150.5 },
            category: { type: 'string', example: 'Alimentación' },
            date: { type: 'string', format: 'date-time', example: '2024-06-15T12:00:00.000Z' },
            note: { type: 'string', example: 'Supermercado', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateExpense: {
          type: 'object',
          required: ['amount', 'category', 'date'],
          properties: {
            amount: { type: 'number', example: 150.5 },
            category: { type: 'string', example: 'Alimentación' },
            date: { type: 'string', format: 'date-time', example: '2024-06-15T12:00:00.000Z' },
            note: { type: 'string', example: 'Supermercado' },
          },
        },
        UpdateExpense: {
          type: 'object',
          properties: {
            amount: { type: 'number', example: 200 },
            category: { type: 'string', example: 'Transporte' },
            date: { type: 'string', format: 'date-time' },
            note: { type: 'string', example: 'Taxi' },
          },
        },
        ExpenseResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: '#/components/schemas/Expense' },
          },
        },
        ExpenseListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            count: { type: 'integer', example: 5 },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Expense' },
            },
          },
        },
        DailyTotal: {
          type: 'object',
          properties: {
            date: { type: 'string', example: '2024-06-15' },
            total: { type: 'number', example: 320.5 },
            count: { type: 'integer', example: 3 },
          },
        },
        DailyTotalsResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array', items: { $ref: '#/components/schemas/DailyTotal' } },
          },
        },
        MonthlyTotal: {
          type: 'object',
          properties: {
            month: { type: 'string', example: '2024-06' },
            total: { type: 'number', example: 4200.75 },
            count: { type: 'integer', example: 28 },
          },
        },
        MonthlyTotalsResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array', items: { $ref: '#/components/schemas/MonthlyTotal' } },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Datos inválidos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'El monto debe ser positivo' },
                },
              },
            },
          },
        },
        NotFound: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Gasto no encontrado' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./dist/routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
