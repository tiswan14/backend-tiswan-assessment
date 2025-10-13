import { prisma } from '../../src/config/prisma.js'
import {
    createUser,
    findUserByEmail,
} from '../../src/repositories/auth.repository.js'

// Mock prisma client
jest.mock('../../src/config/prisma.js', () => ({
    prisma: {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}))

describe('auth.repository', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    // ---------------- CREATE USER ----------------
    describe('createUser', () => {
        it('should create a new user', async () => {
            const fakeUser = {
                id: 'user1',
                name: 'Test',
                email: 'test@mail.com',
                password: 'hashedPassword',
                role: 'USER',
            }
            prisma.user.create.mockResolvedValue(fakeUser)

            const result = await createUser({
                name: 'Test',
                email: 'test@mail.com',
                password: 'hashedPassword',
                role: 'USER',
            })

            expect(result).toEqual(fakeUser)
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    name: 'Test',
                    email: 'test@mail.com',
                    password: 'hashedPassword',
                    role: 'USER',
                },
            })
        })
    })

    // ---------------- FIND USER BY EMAIL ----------------
    describe('findUserByEmail', () => {
        it('should return user if found by email', async () => {
            const fakeUser = { id: 'user1', email: 'test@mail.com' }
            prisma.user.findUnique.mockResolvedValue(fakeUser)

            const result = await findUserByEmail('test@mail.com')
            expect(result).toEqual(fakeUser)
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@mail.com' },
            })
        })

        it('should return null if user not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null)

            const result = await findUserByEmail('unknown@mail.com')
            expect(result).toBeNull()
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'unknown@mail.com' },
            })
        })
    })
})
