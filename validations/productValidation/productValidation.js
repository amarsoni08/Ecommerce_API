import Joi from "joi";
export const productValidationSchema = Joi.object({
    productName: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    price: Joi.number().min(0).required(),
    quantity: Joi.number().min(0).required(),
    category_id: Joi.string().required(), 
});


export const updateProductValidationSchema = Joi.object({
  productName: Joi.string()
    .min(3)
    .max(50)
    .messages({
      "string.min": "Product name should have at least 3 characters",
      "string.max": "Product name should have at most 50 characters",
    }),
  description: Joi.string()
    .min(5)
    .max(500)
    .messages({
      "string.min": "Description should have at least 5 characters",
      "string.max": "Description should have at most 500 characters",
    }),
  price: Joi.number()
    .min(0)
    .messages({
      "number.min": "Price cannot be negative",
      "number.base": "Price must be a number",
    }),
  quantity: Joi.number()
    .min(0)
    .messages({
      "number.min": "Quantity cannot be negative",
      "number.base": "Quantity must be a number",
    }),
});
