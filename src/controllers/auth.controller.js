// File: src/controllers/auth.controller.js

import { signupSchema } from '../validators/auth.validator.js'
import { authService } from '../services/auth.service.js'

export async function signup(req, res, next) {
    try {
        const { error, value } = signupSchema.validate(req.body, {
            abortEarly: false,
        })

        if (error) {
            const errors = {}
            error.details.forEach((detail) => {
                const key = detail.path[0]
                const cleanMessage = detail.message.replace(/["]/g, '')
                errors[key] = cleanMessage
            })
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            })
        }

        const { name, email, password, role } = value

        const newUser = await authService.registerUser({
            name,
            email,
            password,
            role,
        })

        res.status(201).json({
            message: 'User created successfully',
            user: { id: newUser.id, email: newUser.email, role: newUser.role },
        })
    } catch (error) {
        if (error.message.includes('already in use')) {
            return res.status(409).json({ message: error.message })
        }
        next(error)
    }
}
