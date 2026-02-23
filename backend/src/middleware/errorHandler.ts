import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { config } from "../config";

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: config.rateLimit.rpm,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

export const botLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: config.rateLimit.botRpm,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  console.error("[ErrorHandler]", err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.status(404).json({ error: "Not found" });
}

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[Request] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`,
    );
  });

  next();
}
