import * as tokenUtils from '../../../src/utils/token.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

// Mock jwt dan crypto
jest.mock('jsonwebtoken')
jest.mock('crypto')

describe('tokenUtils', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    // ---------------- generateAccessToken ----------------
    describe('generateAccessToken', () => {
        it('should call jwt.sign with payload and secret', () => {
            process.env.JWT_SECRET = 'testsecret'
            jwt.sign.mockReturnValue('mockedAccessToken')

            const payload = { userId: 1 }
            const token = tokenUtils.generateAccessToken(payload)

            expect(jwt.sign).toHaveBeenCalledWith(payload, 'testsecret', {
                expiresIn: '24h',
            })
            expect(token).toBe('mockedAccessToken')
        })
    })

    // ---------------- generateRefreshToken ----------------
    describe('generateRefreshToken', () => {
        it('should call crypto.randomBytes and return hex string', () => {
            crypto.randomBytes.mockReturnValue({
                toString: jest.fn().mockReturnValue('mockedRefreshToken'),
            })

            const token = tokenUtils.generateRefreshToken()

            expect(crypto.randomBytes).toHaveBeenCalledWith(32)
            expect(token).toBe('mockedRefreshToken')
        })
    })

    // ---------------- verifyAccessToken ----------------
    describe('verifyAccessToken', () => {
        it('should return decoded payload if token is valid', () => {
            const decoded = { userId: 1 }
            jwt.verify.mockReturnValue(decoded)

            const token = 'validToken'
            const result = tokenUtils.verifyAccessToken(token)

            expect(jwt.verify).toHaveBeenCalledWith(
                token,
                process.env.JWT_SECRET
            )
            expect(result).toEqual(decoded)
        })

        it('should return null if token is invalid', () => {
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token')
            })

            const token = 'invalidToken'
            const result = tokenUtils.verifyAccessToken(token)

            expect(jwt.verify).toHaveBeenCalledWith(
                token,
                process.env.JWT_SECRET
            )
            expect(result).toBeNull()
        })
    })
})
