import { jest } from '@jest/globals'

import { authorizeRoles } from '../../../src/middlewares/rbac.middleware.js'

describe('🛡️ authorizeRoles Middleware Unit Tests', () => {
    let req, res, next

    beforeEach(() => {
        req = {}
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }
        next = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('✅ should call next() if user has allowed role', () => {
        const middleware = authorizeRoles('ADMIN', 'MANAGER')
        req.user = { role: 'ADMIN' }

        middleware(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
    })

    it('🚫 should return 401 if user is missing', () => {
        const middleware = authorizeRoles('ADMIN', 'MANAGER')
        req.user = null

        middleware(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized.' })
        expect(next).not.toHaveBeenCalled()
    })

    it('🚫 should return 401 if user has no role property', () => {
        const middleware = authorizeRoles('ADMIN', 'MANAGER')
        req.user = {}

        middleware(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized.' })
        expect(next).not.toHaveBeenCalled()
    })

    it('🚫 should return 403 if user role is not allowed', () => {
        const middleware = authorizeRoles('ADMIN', 'MANAGER')
        req.user = { role: 'USER' }

        middleware(req, res, next)

        expect(res.status).toHaveBeenCalledWith(403)
        expect(res.json).toHaveBeenCalledWith({
            message: 'Access denied. You do not have the required role.',
        })
        expect(next).not.toHaveBeenCalled()
    })

    it('✅ should allow multiple roles dynamically', () => {
        const middleware = authorizeRoles('ADMIN', 'MANAGER', 'USER')
        req.user = { role: 'USER' }

        middleware(req, res, next)

        expect(next).toHaveBeenCalled()
    })
})
