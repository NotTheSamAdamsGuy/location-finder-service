import { NextFunction, Request, Response } from "express";

import { logger } from "../logging/logger.ts";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Determine the status code and message
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log any server errors
  if (statusCode === 500) logger.error(err);

  // Send a JSON response with the error details
  res.status(statusCode).json({
    status: "error",
    message: message,
    errors: err.errors,
    // Include stack trace in development for debugging, but not in production
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}