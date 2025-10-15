import { jest } from '@jest/globals'
import rateLimit from 'express-rate-limit'

// 🧠 Mock dulu fungsi `express-rate-limit`
jest.mock('express-rate-limit', () => jest.fn((config) => config))

describe('🚦 rateLimiter Middleware Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('✅ should initialize express-rate-limit with correct configuration', async () => {
        // 🧩 Load ulang modul rateLimiter setelah mock aktif
        let rateLimiter
        jest.isolateModules(() => {
            rateLimiter =
                require('../../../src/middlewares/rate.limiter.js').default
        })

        expect(rateLimit).toHaveBeenCalledWith({
            windowMs: 15 * 60 * 1000,
            max: 10,
            message: { message: 'Too many requests. Try again later.' },
        })

        // opsional: pastikan objek export sesuai
        expect(rateLimiter.max).toBe(10)
        expect(rateLimiter.windowMs).toBe(15 * 60 * 1000)
    })

    it('✅ should export a valid middleware configuration object', async () => {
        let rateLimiter
        jest.isolateModules(() => {
            rateLimiter =
                require('../../../src/middlewares/rate.limiter.js').default
        })

        expect(rateLimiter).toHaveProperty('windowMs', 15 * 60 * 1000)
        expect(rateLimiter).toHaveProperty('max', 10)
        expect(rateLimiter).toHaveProperty('message')
        expect(rateLimiter.message).toEqual({
            message: 'Too many requests. Try again later.',
        })
    })
})
