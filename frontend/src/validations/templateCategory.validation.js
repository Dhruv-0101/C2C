import { z } from "zod";

/**
 * Zod validation schema for Master Template Category forms (Create & Edit)
 */
export const templateCategoryFormSchema = z.object({
  name: z
    .string({ required_error: "Template category name is required" })
    .trim()
    .min(2, "Template category name must be at least 2 characters")
    .max(50, "Template category name cannot exceed 50 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});
