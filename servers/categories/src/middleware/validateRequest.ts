import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import {
  CategoryType,
  DishType,
  categorySchema,
} from "@hi/db-models/src/validators"; // Update with the correct path

export const validate = (schema: typeof categorySchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  };
};
