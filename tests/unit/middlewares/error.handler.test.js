import { jest } from '@jest/globals'
import { errorHandler } from '../../../src/middlewares/error.handler.js'

describe('💥 errorHandler Middleware Unit Tests', () => {
    let req, res, next

    beforeEach(() => {
        req = {}
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }
        next = jest.fn()

        jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('✅ should handle default error (500 Internal Server Error)', () => {
        process.env.NODE_ENV = 'production' // aktifkan log
        const err = new Error('Something went wrong')

        errorHandler(err, req, res, next)

        expect(console.error).toHaveBeenCalledWith('[500] Something went wrong')
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Something went wrong',
        })
    })

    it('✅ should handle custom error with statusCode', () => {
        process.env.NODE_ENV = 'production'
        const err = { statusCode: 404, message: 'Resource not found' }

        errorHandler(err, req, res, next)

        expect(console.error).toHaveBeenCalledWith('[404] Resource not found')
        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Resource not found',
        })
    })

    it('✅ should handle error with "status" property', () => {
        process.env.NODE_ENV = 'production'
        const err = { status: 401, message: 'Unauthorized' }

        errorHandler(err, req, res, next)

        expect(console.error).toHaveBeenCalledWith('[401] Unauthorized')
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Unauthorized',
        })
    })

    it('🧩 should include stack trace in development mode', () => {
        process.env.NODE_ENV = 'development'
        const err = new Error('Dev error')
        err.stack = 'Mock stack'

        errorHandler(err, req, res, next)

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Dev error',
            stack: 'Mock stack',
        })
    })

    it('🧪 should not log in test mode', () => {
        process.env.NODE_ENV = 'test'
        const err = new Error('Silent error')

        errorHandler(err, req, res, next)

        expect(console.error).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(500)
    })
})
