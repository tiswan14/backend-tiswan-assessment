import Joi from 'joi'

export const registerSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('ADMIN', 'MANAGER', 'USER').default('USER'),
})

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
})

export const refreshSchema = Joi.object({
    refreshToken: Joi.string().required(),
})
