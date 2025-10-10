import Joi from 'joi'

export const signupSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('ADMIN', 'MANAGER', 'USER').default('USER'),
})
