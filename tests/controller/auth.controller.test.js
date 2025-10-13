// tests/controller/auth.controller.test.js
import {
    register,
    login,
    refresh,
} from '../../src/controllers/auth.controller.js'
import { authService } from '../../src/services/auth.service.js'

// Mock authService sesuai named export
jest.mock('../../src/services/auth.service.js', () => ({
    authService: {
        registerUser: jest.fn(),
        loginUser: jest.fn(),
        refreshToken: jest.fn(),
    },
}))

describe('Auth Controller', () => {
    let req, res, next

    beforeEach(() => {
        req = { body: {} }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }
        next = jest.fn()
        jest.clearAllMocks()
    })

    // =========================
    // REGISTER
    // =========================
    describe('register', () => {
        it('should return 400 if validation fails', async () => {
            req.body = { name: 'A', email: 'invalid-email' } // invalid input
            await register(req, res, next)
            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: 'Validation failed',
                })
            )
        })

        it('should register user successfully', async () => {
            req.body = {
                name: 'Test',
                email: 'test@mail.com',
                password: '12345678',
                role: 'USER',
            }
            const mockUser = {
                id: 1,
                name: 'Test',
                email: 'test@mail.com',
                role: 'USER',
            }

            authService.registerUser.mockResolvedValue(mockUser)

            await register(req, res, next)

            expect(authService.registerUser).toHaveBeenCalledWith(req.body)
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'User created successfully',
                    user: { id: 1, email: 'test@mail.com', role: 'USER' },
                })
            )
        })

        it('should return 409 if email already in use', async () => {
            req.body = {
                name: 'Test',
                email: 'test@mail.com',
                password: '12345678',
                role: 'USER',
            }

            authService.registerUser.mockRejectedValue(
                new Error('Email already in use')
            )

            await register(req, res, next)

            expect(res.status).toHaveBeenCalledWith(409)
            expect(res.json).toHaveBeenCalledWith({
                message: 'Email already in use',
            })
        })

        it('should call next on other errors', async () => {
            const error = new Error('Some error')
            req.body = {
                name: 'Test',
                email: 'test@mail.com',
                password: '12345678',
                role: 'USER',
            }

            authService.registerUser.mockRejectedValue(error)

            await register(req, res, next)

            expect(next).toHaveBeenCalledWith(error)
        })
    })

    // =========================
    // LOGIN
    // =========================
    describe('login', () => {
        it('should return 400 if validation fails', async () => {
            req.body = { email: 'invalid-email', password: '' }
            await login(req, res, next)
            expect(res.status).toHaveBeenCalledWith(400)
        })

        it('should login successfully', async () => {
            req.body = { email: 'test@mail.com', password: '12345678' }
            const tokens = {
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
            }

            authService.loginUser.mockResolvedValue(tokens)

            await login(req, res, next)

            expect(authService.loginUser).toHaveBeenCalledWith(req.body)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: 'Login successful',
                    data: tokens,
                })
            )
        })

        it('should return 401 if invalid credentials', async () => {
            req.body = { email: 'test@mail.com', password: 'wrong-pass' }
            authService.loginUser.mockRejectedValue(
                new Error('Invalid credentials')
            )

            await login(req, res, next)

            expect(res.status).toHaveBeenCalledWith(401)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid credentials',
            })
        })
    })

    // =========================
    // REFRESH TOKEN
    // =========================
    describe('refresh', () => {
        it('should return 400 if validation fails', async () => {
            req.body = { refreshToken: '' } // invalid
            await refresh(req, res, next)
            expect(res.status).toHaveBeenCalledWith(400)
        })

        it('should refresh token successfully', async () => {
            req.body = { refreshToken: 'refresh-token' }
            const newTokens = {
                accessToken: 'new-access',
                refreshToken: 'new-refresh',
            }

            authService.refreshToken.mockResolvedValue(newTokens)

            await refresh(req, res, next)

            expect(authService.refreshToken).toHaveBeenCalledWith(
                'refresh-token'
            )
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: 'Token refreshed successfully',
                    data: newTokens,
                })
            )
        })

        it('should return 401 if token invalid or expired', async () => {
            req.body = { refreshToken: 'refresh-token' }
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

        it('should call next on other errors', async () => {
            const error = new Error('Some error')
            req.body = { refreshToken: 'refresh-token' }
            authService.refreshToken.mockRejectedValue(error)

            await refresh(req, res, next)

            expect(next).toHaveBeenCalledWith(error)
        })
    })
})
