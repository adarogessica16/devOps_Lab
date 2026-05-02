import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Prisma: registro no encontrado al hacer delete/update
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const prismaErr = err as { code: string; message: string };
    if (prismaErr.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }
  }

  console.error(err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
}
