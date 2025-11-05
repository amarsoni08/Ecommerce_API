import joi from "joi";

export const adminValidationSchema = joi.object({
    adminName: joi.string().min(3).max(50).required(),
    email: joi.string().email().required(),
    password: joi.string()
    .trim() // start/end ke spaces remove karega automatically
    .pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})[^\s]+$/)
    .message('Password must be at least 8 characters long, include a number, a special character and no spaces')
    .required(),
});

export const adminLoginValidationSchema = joi.object({
  email: joi.string().email().optional().messages({
    "string.email": "Please enter a valid email address",
  }),
  adminName: joi.string().optional().messages({
    "string.empty": "Admin name cannot be empty",
  }),
  password: joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Password is required",
    }),
});