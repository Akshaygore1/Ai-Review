import { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
  statusCode?: number;
  details?: any;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const details = err.details || null;

  // Log error for debugging
  console.error(`[Error] ${statusCode}: ${message}`, {
    path: req.path,
    details,
    stack: err.stack,
  });

  res.status(statusCode).json({
    status: "error",
    message,
    details,
  });
};

export class HttpError extends Error implements ApiError {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = "HttpError";
  }
}
