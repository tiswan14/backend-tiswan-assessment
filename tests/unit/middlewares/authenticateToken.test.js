import { jest } from '@jest/globals'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../src/config/prisma.js'
import { authenticateToken } from '../../../src/middlewares/auth.middleware.js'

// 🧩 Mock dependencies
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
}))
jest.mock('../../../src/config/prisma.js', () => ({
    prisma: {
        refreshToken: {
            findFirst: jest.fn(),
        },
    },
}))

describe('🔐 authenticateToken Middleware Unit Tests', () => {
    let req, res, next

    beforeEach(() => {
        req = {
            headers: {},
        }
        res = {}
        next = jest.fn()
        jest.clearAllMocks()
    })

    // ---------------- NO TOKEN ----------------
    it('🚫 should call next with 401 if no token provided', async () => {
        req.headers['authorization'] = null

        await authenticateToken(req, res, next)

        expect(next).toHaveBeenCalledWith({
            status: 401,
            message: 'Access denied. No token provided.',
        })
    })

    // ---------------- INVALID TOKEN ----------------
    it('🚫 should call next with 401 if token invalid', async () => {
        req.headers['authorization'] = 'Bearer invalidToken'
        const jwtError = new Error('invalid signature')
        jwtError.name = 'JsonWebTokenError'
        jwt.verify.mockImplementation(() => {
            throw jwtError
        })

        await authenticateToken(req, res, next)

        expect(next).toHaveBeenCalledWith({
            status: 401,
            message: 'Invalid or expired token.',
        })
    })

    // ---------------- EXPIRED TOKEN ----------------
    it('🚫 should call next with 403 if token expired', async () => {
        req.headers['authorization'] = 'Bearer expiredToken'
        const jwtError = new Error('jwt expired')
        jwtError.name = 'TokenExpiredError'
        jwt.verify.mockImplementation(() => {
            throw jwtError
        })

        await authenticateToken(req, res, next)

        expect(next).toHaveBeenCalledWith({
            status: 401,
            message: 'Invalid or expired token.',
        })
    })

    // ---------------- VALID TOKEN BUT NO SESSION ----------------
    it('🚫 should call next with 401 if no session found in DB', async () => {
        req.headers['authorization'] = 'Bearer validToken'
        jwt.verify.mockReturnValue({ userId: 'user123' })
        prisma.refreshToken.findFirst.mockResolvedValue(null)

        await authenticateToken(req, res, next)

        expect(prisma.refreshToken.findFirst).toHaveBeenCalledWith({
            where: { user_id: 'user123' },
        })
        expect(next).toHaveBeenCalledWith({
            status: 401,
            message: 'Session expired or user logged out.',
        })
    })

    // ---------------- VALID TOKEN & SESSION ----------------
    it('✅ should call next() and attach user to req when token valid', async () => {
        req.headers['authorization'] = 'Bearer validToken'
        const mockUser = { userId: 'user123', role: 'ADMIN' }

        jwt.verify.mockReturnValue(mockUser)
        prisma.refreshToken.findFirst.mockResolvedValue({ id: 'session1' })

        await authenticateToken(req, res, next)

        expect(jwt.verify).toHaveBeenCalledWith(
            'validToken',
            process.env.JWT_ACCESS_SECRET
        )
        expect(prisma.refreshToken.findFirst).toHaveBeenCalledWith({
            where: { user_id: 'user123' },
        })
        expect(req.user).toEqual(mockUser)
        expect(next).toHaveBeenCalledWith() // No error passed
    })

    // ---------------- UNEXPECTED ERROR ----------------
    it('🚫 should call next(error) if unexpected error occurs', async () => {
        req.headers['authorization'] = 'Bearer validToken'
        const unknownError = new Error('Something went wrong')
        jwt.verify.mockImplementation(() => {
            throw unknownError
        })

        await authenticateToken(req, res, next)
        expect(next).toHaveBeenCalledWith(unknownError)
    })
})
