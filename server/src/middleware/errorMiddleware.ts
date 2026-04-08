import type { NextFunction, Request, Response } from 'express';

export function notFound(req: Request, res: Response, next: NextFunction): void {
  res.status(404);
  const err = new Error(`Not found: ${req.originalUrl}`);
  next(err);
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const message = err instanceof Error ? err.message : 'Server error';
  const stack = err instanceof Error ? err.stack : undefined;
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && stack ? { stack } : {}),
  });
}
