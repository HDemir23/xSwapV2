import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export type ValidationTarget = "body" | "query" | "params";

export interface ValidationError {
  field: string;
  message: string;
}

export function validate(
  schema: z.ZodSchema,
  target: ValidationTarget = "body",
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[target];

    try {
      const result = schema.parse(data);
      req[target] = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationError[] = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: errors,
          },
        });
        return;
      }

      next(error);
    }
  };
}

export function validateBody(schema: z.ZodSchema) {
  return validate(schema, "body");
}

export function validateQuery(schema: z.ZodSchema) {
  return validate(schema, "query");
}

export function validateParams(schema: z.ZodSchema) {
  return validate(schema, "params");
}

export function validateAll(schemas: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as typeof req.query;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationError[] = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: errors,
          },
        });
        return;
      }

      next(error);
    }
  };
}
