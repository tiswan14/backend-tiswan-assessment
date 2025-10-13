// tests/repositories/refreshToken.repository.test.js
import { prisma } from '../../src/config/prisma.js'
import {
    createRefreshToken,
    findRefreshToken,
    deleteRefreshToken,
} from '../../src/repositories/refreshToken.repository.js'

// Mock prisma client
jest.mock('../../src/config/prisma.js', () => ({
    prisma: {
        refreshToken: {
            create: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
        },
    },
}))

describe('refreshToken.repository', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    // ---------------- CREATE REFRESH TOKEN ----------------
    describe('createRefreshToken', () => {
        it('should create a refresh token successfully', async () => {
            const fakeToken = {
                user_id: 'user1',
                token: 'refresh-token',
                expires_at: new Date(),
            }

            prisma.refreshToken.create.mockResolvedValue(fakeToken)

            const result = await createRefreshToken(
                'user1',
                'refresh-token',
                fakeToken.expires_at
            )

            expect(result).toEqual(fakeToken)
            expect(prisma.refreshToken.create).toHaveBeenCalledWith({
                data: {
                    user_id: 'user1',
                    token: 'refresh-token',
                    expires_at: fakeToken.expires_at,
                },
            })
        })
    })

    // ---------------- FIND REFRESH TOKEN ----------------
    describe('findRefreshToken', () => {
        it('should return refresh token if found', async () => {
            const fakeToken = { token: 'refresh-token', user_id: 'user1' }
            prisma.refreshToken.findUnique.mockResolvedValue(fakeToken)

            const result = await findRefreshToken('refresh-token')
            expect(result).toEqual(fakeToken)
            expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
                where: { token: 'refresh-token' },
            })
        })

        it('should return null if token not found', async () => {
            prisma.refreshToken.findUnique.mockResolvedValue(null)

            const result = await findRefreshToken('notfound')
            expect(result).toBeNull()
            expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
                where: { token: 'notfound' },
            })
        })
    })

    // ---------------- DELETE REFRESH TOKEN ----------------
    describe('deleteRefreshToken', () => {
        it('should delete refresh token successfully', async () => {
            const fakeToken = { token: 'refresh-token', user_id: 'user1' }
            prisma.refreshToken.delete.mockResolvedValue(fakeToken)

            const result = await deleteRefreshToken('refresh-token')
            expect(result).toEqual(fakeToken)
            expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
                where: { token: 'refresh-token' },
            })
        })
    })
})
