import { jest } from '@jest/globals'
// tests/utils/hash.test.js
import * as hashUtils from '../../../src/utils/hash.js'
import bcrypt from 'bcrypt'

// Mock bcrypt agar tidak melakukan hashing asli
jest.mock('bcrypt')

describe('hashUtils', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    // ---------------- hashPassword ----------------
    describe('hashPassword', () => {
        it('should call bcrypt.genSalt and bcrypt.hash', async () => {
            // Mock nilai yang dikembalikan
            bcrypt.genSalt.mockResolvedValue('salt')
            bcrypt.hash.mockResolvedValue('hashedPassword')

            const result = await hashUtils.hashPassword('myPassword')

            // Pastikan fungsi bcrypt dipanggil dengan argumen yang benar
            expect(bcrypt.genSalt).toHaveBeenCalledWith(10)
            expect(bcrypt.hash).toHaveBeenCalledWith('myPassword', 'salt')
            expect(result).toBe('hashedPassword')
        })

        it('should throw error if bcrypt.hash fails', async () => {
            bcrypt.genSalt.mockResolvedValue('salt')
            bcrypt.hash.mockRejectedValue(new Error('Hash failed'))

            await expect(hashUtils.hashPassword('myPassword')).rejects.toThrow(
                'Hash failed'
            )
        })
    })

    // ---------------- comparePassword ----------------
    describe('comparePassword', () => {
        it('should call bcrypt.compare and return true if passwords match', async () => {
            bcrypt.compare.mockResolvedValue(true)

            const result = await hashUtils.comparePassword(
                'myPassword',
                'hashedPassword'
            )

            expect(bcrypt.compare).toHaveBeenCalledWith(
                'myPassword',
                'hashedPassword'
            )
            expect(result).toBe(true)
        })

        it('should call bcrypt.compare and return false if passwords do not match', async () => {
            bcrypt.compare.mockResolvedValue(false)

            const result = await hashUtils.comparePassword(
                'wrongPassword',
                'hashedPassword'
            )

            expect(bcrypt.compare).toHaveBeenCalledWith(
                'wrongPassword',
                'hashedPassword'
            )
            expect(result).toBe(false)
        })

        it('should throw error if bcrypt.compare fails', async () => {
            bcrypt.compare.mockRejectedValue(new Error('Compare failed'))

            await expect(
                hashUtils.comparePassword('pass', 'hashed')
            ).rejects.toThrow('Compare failed')
        })
    })
})
