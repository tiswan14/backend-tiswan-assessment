import { jest } from '@jest/globals'
import {
    register,
    login,
    refresh,
    logout,
} from '../../../src/controllers/auth.controller.js'
import { authService } from '../../../src/services/auth.service.js'
import {
    registerSchema,
    loginSchema,
    refreshSchema,
} from '../../../src/validators/auth.validator.js'

// 🧩 Mock dependencies
jest.mock('../../../src/services/auth.service.js', () => ({
    authService: {
        registerUser: jest.fn(),
        loginUser: jest.fn(),
        refreshToken: jest.fn(),
        logoutUser: jest.fn(),
    },
}))
jest.mock('../../../src/validators/auth.validator.js', () => ({
    registerSchema: { validate: jest.fn() },
    loginSchema: { validate: jest.fn() },
    refreshSchema: { validate: jest.fn() },
}))

describe('🧠 Auth Controller Unit Tests', () => {
    let req, res, next

    beforeEach(() => {
        req = { body: {}, user: { userId: '123' } }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }
        next = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    // ---------------- REGISTER ----------------
    describe('register', () => {
        it('✅ should register user successfully', async () => {
            registerSchema.validate.mockReturnValue({
                value: {
                    name: 'Tiswan',
                    email: 'a@mail.com',
                    password: '123',
                    role: 'USER',
                },
            })
            authService.registerUser.mockResolvedValue({
                id: '1',
                email: 'a@mail.com',
                role: 'USER',
            })

            await register(req, res, next)

            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith({
                message: 'User created successfully',
                user: { id: '1', email: 'a@mail.com', role: 'USER' },
            })
        })

        it('🚫 should return 400 if validation fails', async () => {
            registerSchema.validate.mockReturnValue({
                error: {
                    details: [
                        { path: ['email'], message: '"email" is required' },
                    ],
                },
            })

            await register(req, res, next)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Validation failed',
                errors: { email: 'email is required' },
            })
        })

        it('🚫 should return 409 if email already exists', async () => {
            registerSchema.validate.mockReturnValue({ value: {} })
            authService.registerUser.mockRejectedValue(
                new Error('Email already in use')
            )

            await register(req, res, next)

            expect(res.status).toHaveBeenCalledWith(409)
            expect(res.json).toHaveBeenCalledWith({
                message: 'Email already in use',
            })
        })
    })

    // ---------------- LOGIN ----------------
    describe('login', () => {
        it('✅ should login successfully', async () => {
            loginSchema.validate.mockReturnValue({
                value: { email: 'a@mail.com', password: '123' },
            })
            authService.loginUser.mockResolvedValue({
                accessToken: 'a',
                refreshToken: 'b',
            })

            await login(req, res, next)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Login successful',
                data: { accessToken: 'a', refreshToken: 'b' },
            })
        })

        it('🚫 should return 400 if validation fails', async () => {
            loginSchema.validate.mockReturnValue({
                error: { details: [{ message: '"email" is required' }] },
            })

            await login(req, res, next)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'email is required',
            })
        })

        it('🚫 should return 401 if invalid credentials', async () => {
            loginSchema.validate.mockReturnValue({ value: {} })
            authService.loginUser.mockRejectedValue(
                new Error('Invalid email or password.')
            )

            await login(req, res, next)

            expect(res.status).toHaveBeenCalledWith(401)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid email or password.',
            })
        })
    })

    // ---------------- REFRESH ----------------
    describe('refresh', () => {
        it('✅ should refresh token successfully', async () => {
            refreshSchema.validate.mockReturnValue({
                value: { refreshToken: 'abc' },
            })
            authService.refreshToken.mockResolvedValue({
                accessToken: 'newToken',
            })

            await refresh(req, res, next)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Token refreshed successfully',
                data: { accessToken: 'newToken' },
            })
        })

        it('🚫 should return 400 if validation fails', async () => {
            refreshSchema.validate.mockReturnValue({
                error: { details: [{ message: 'refreshToken is required' }] },
            })

            await refresh(req, res, next)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'refreshToken is required',
            })
        })

        it('🚫 should return 401 if token invalid or expired', async () => {
            refreshSchema.validate.mockReturnValue({
                value: { refreshToken: 'abc' },
            })
            authService.refreshToken.mockRejectedValue(
                new Error('Invalid refresh token')
            )

            await refresh(req, res, next)

            expect(res.status).toHaveBeenCalledWith(401)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid refresh token',
            })
        })
    })

    // ---------------- LOGOUT ----------------
    describe('logout', () => {
        it('✅ should logout successfully', async () => {
            authService.logoutUser.mockResolvedValue(true)
            req.user = { userId: '123' }

            await logout(req, res, next)

            expect(authService.logoutUser).toHaveBeenCalledWith('123')
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Logout successful',
            })
        })

        it('🚫 should return 401 if no userId', async () => {
            req.user = null
            await logout(req, res, next)

            expect(res.status).toHaveBeenCalledWith(401)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Unauthorized: missing user',
            })
        })
    })
})
