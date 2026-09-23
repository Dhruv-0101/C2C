import { z } from "zod";

/**
 * Zod validation schema for Business Industry Category forms (Create & Edit)
 */
export const categoryFormSchema = z.object({
  name: z
    .string({ required_error: "Category name is required" })
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(60, "Category name cannot exceed 60 characters"),
  description: z
    .string()
    .trim()
    .max(300, "Description cannot exceed 300 characters")
    .optional()
    .or(z.literal("")),
});
