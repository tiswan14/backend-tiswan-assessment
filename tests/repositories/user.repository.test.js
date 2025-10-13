// tests/repositories/user.repository.test.js
import { prisma } from '../../src/config/prisma.js'
import { findUserById } from '../../src/repositories/user.repository.js'

// Mock Prisma
jest.mock('../../src/config/prisma.js', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
    },
}))

describe('user.repository', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('findUserById', () => {
        it('should return user if found', async () => {
            const fakeUser = { id: 1, name: 'John Doe' }
            prisma.user.findUnique.mockResolvedValue(fakeUser)

            const result = await findUserById(1)
            expect(result).toEqual(fakeUser)
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            })
        })

        it('should return null if user not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null)

            const result = await findUserById(99)
            expect(result).toBeNull()
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 99 },
            })
        })
    })
})
