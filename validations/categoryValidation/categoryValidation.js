import Joi from "joi";

export const categoryValidationSchema = Joi.object({
  categoryName: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "Category name is required",
    "string.min": "Category name must be at least 2 characters",
    "any.required": "Category name is required"
  })
});
