import Joi from 'joi'

export const taskCreateSchema = Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(1000).optional(),
    status: Joi.string().valid('TODO', 'IN_PROGRESS', 'DONE').optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
    due_date: Joi.date().iso().required().min(Date.now()),
    assigned_to_id: Joi.string().optional(),
})

export const taskUpdateSchema = Joi.object({
    title: Joi.string().min(3).max(255).optional(),
    description: Joi.string().max(1000).optional(),
    status: Joi.string().valid('TODO', 'IN_PROGRESS', 'DONE').optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
    due_date: Joi.date().iso().min(Date.now()).optional(),
    assigned_to_id: Joi.string().optional(),
})
