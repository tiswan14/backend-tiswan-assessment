import {
    registerSchema,
    loginSchema,
    refreshSchema,
} from '../validators/auth.validator.js'
import { authService } from '../services/auth.service.js'

export async function register(req, res, next) {
    try {
        const { error, value } = registerSchema.validate(req.body, {
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

export const login = async (req, res, next) => {
    try {
        const { error, value } = loginSchema.validate(req.body)

        if (error) {
            const errorMessage = error.details[0].message.replace(/"/g, '') // Menghapus semua tanda kutip ganda

            return res.status(400).json({
                success: false,
                message: errorMessage,
            })
        }

        const { email, password } = value

        const tokens = await authService.loginUser({ email, password })

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: tokens,
        })
    } catch (error) {
        if (error.message.includes('Invalid')) {
            return res
                .status(401)
                .json({ success: false, message: error.message })
        }
        next(error)
    }
}

export const refresh = async (req, res, next) => {
    try {
        const { error, value } = refreshSchema.validate(req.body)

        if (error) {
            return res
                .status(400)
                .json({ success: false, message: error.details[0].message })
        }

        const { refreshToken } = value

        const newTokens = await authService.refreshToken(refreshToken)

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: newTokens,
        })
    } catch (error) {
        if (
            error.message.includes('Invalid') ||
            error.message.includes('expired')
        ) {
            return res
                .status(401)
                .json({ success: false, message: error.message })
        }
        next(error)
    }
}

export const logout = async (req, res, next) => {
    try {
        const userId = req.user?.userId

        if (!userId) {
            return res
                .status(401)
                .json({ success: false, message: 'Unauthorized: missing user' })
        }

        await authService.logoutUser(userId)

        res.status(200).json({
            success: true,
            message: 'Logout successful',
        })
    } catch (error) {
        next(error)
    }
}
