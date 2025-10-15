import { jest } from '@jest/globals'
import { prisma } from '../../../src/config/prisma.js'
import {
    createRefreshToken,
    findRefreshToken,
    deleteRefreshToken,
    deleteRefreshTokensByUserId,
} from '../../../src/repositories/refreshToken.repository.js'

jest.mock('../../../src/config/prisma.js', () => ({
    prisma: {
        refreshToken: {
            create: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
    },
}))

describe('🔁 refreshToken.repository Unit Tests', () => {
    afterEach(() => jest.clearAllMocks())

    it('✅ should create refresh token', async () => {
        const mockToken = { id: 1, token: 'abc123' }
        prisma.refreshToken.create.mockResolvedValue(mockToken)

        const result = await createRefreshToken('user1', 'abc123', new Date())

        expect(prisma.refreshToken.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ user_id: 'user1', token: 'abc123' }),
        })
        expect(result).toEqual(mockToken)
    })

    it('✅ should find refresh token', async () => {
        const fakeToken = { token: 'abc123' }
        prisma.refreshToken.findUnique.mockResolvedValue(fakeToken)

        const result = await findRefreshToken('abc123')

        expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
            where: { token: 'abc123' },
        })
        expect(result).toEqual(fakeToken)
    })

    it('✅ should delete refresh token', async () => {
        prisma.refreshToken.delete.mockResolvedValue(true)

        const result = await deleteRefreshToken('token123')

        expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
            where: { token: 'token123' },
        })
        expect(result).toBe(true)
    })

    it('✅ should delete all refresh tokens by user id', async () => {
        prisma.refreshToken.deleteMany.mockResolvedValue({ count: 2 })

        const result = await deleteRefreshTokensByUserId('user123')

        expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
            where: { user_id: 'user123' },
        })
        expect(result).toEqual({ count: 2 })
    })
})
