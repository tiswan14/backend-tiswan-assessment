import {
    registerSchema,
    loginSchema,
    refreshSchema,
} from '../../../src/validators/auth.validator.js'

describe('Auth Validator Schemas', () => {
    // ---------------- Register Schema ----------------
    describe('registerSchema', () => {
        it('should validate a valid register payload', () => {
            const payload = {
                name: 'Tiswan',
                email: 'tiswan@example.com',
                password: 'password123',
                role: 'USER',
            }

            const { error, value } = registerSchema.validate(payload)
            expect(error).toBeUndefined()
            expect(value.role).toBe('USER')
        })

        it('should fail when name is too short', () => {
            const payload = {
                name: 'Ti',
                email: 'tiswan@example.com',
                password: 'password123',
            }

            const { error } = registerSchema.validate(payload)
            expect(error).toBeDefined()
            expect(error.details[0].message).toMatch(/name/)
        })

        it('should fail when email is invalid', () => {
            const payload = {
                name: 'Tiswan',
                email: 'invalid-email',
                password: 'password123',
            }

            const { error } = registerSchema.validate(payload)
            expect(error).toBeDefined()
            expect(error.details[0].message).toMatch(/email/)
        })

        it('should fail when password is too short', () => {
            const payload = {
                name: 'Tiswan',
                email: 'tiswan@example.com',
                password: 'short',
            }

            const { error } = registerSchema.validate(payload)
            expect(error).toBeDefined()
            expect(error.details[0].message).toMatch(/password/)
        })
    })

    // ---------------- Login Schema ----------------
    describe('loginSchema', () => {
        it('should validate a valid login payload', () => {
            const payload = {
                email: 'tiswan@example.com',
                password: 'password123',
            }

            const { error, value } = loginSchema.validate(payload)
            expect(error).toBeUndefined()
            expect(value.email).toBe('tiswan@example.com')
        })

        it('should fail when email is missing', () => {
            const payload = { password: 'password123' }

            const { error } = loginSchema.validate(payload)
            expect(error).toBeDefined()
            expect(error.details[0].message).toMatch(/email/)
        })

        it('should fail when password is missing', () => {
            const payload = { email: 'tiswan@example.com' }

            const { error } = loginSchema.validate(payload)
            expect(error).toBeDefined()
            expect(error.details[0].message).toMatch(/password/)
        })
    })

    // ---------------- Refresh Token Schema ----------------
    describe('refreshSchema', () => {
        it('should validate a valid refresh token payload', () => {
            const payload = { refreshToken: 'valid_refresh_token' }

            const { error, value } = refreshSchema.validate(payload)
            expect(error).toBeUndefined()
            expect(value.refreshToken).toBe('valid_refresh_token')
        })

        it('should fail when refreshToken is missing', () => {
            const payload = {}

            const { error } = refreshSchema.validate(payload)
            expect(error).toBeDefined()
            expect(error.details[0].message).toMatch(/refreshToken/)
        })
    })
})
