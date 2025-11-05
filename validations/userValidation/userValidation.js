import Joi from "joi";

export const userValidationSchema = Joi.object({
    userName: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
    .trim() // start/end ke spaces remove karega automatically
    .pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})[^\s]+$/) 
    .message('Password must be at least 8 characters long, include a number, a special character and no spaces')
    .required(),
    contactNumber: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
    address: Joi.string().max(100).optional(),
});


export const loginValidationSchema = Joi.object({
    userName: Joi.string().required().messages({
        "string.empty": "Email is required",
        "string.name": "Username must be valid"
    }).optional(),
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Please enter a valid email address"
    }).optional(),
    password: Joi.string().min(8).trim().required().messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 8 characters"
    })
});

export const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    newPassword: Joi.string()
    .pattern(new RegExp("^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$"))
    .trim()   // ← yeh starting aur ending spaces remove kar deta hai
    .required()
    .messages({
        "string.pattern.base":
            "Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.",
    })
});