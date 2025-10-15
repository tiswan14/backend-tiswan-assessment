import { jest } from '@jest/globals'
import { prisma } from '../../../src/config/prisma.js'
import {
    createUser,
    findUserByEmail,
} from '../../../src/repositories/auth.repository.js'

// 🧠 Mock prisma agar tidak benar-benar akses database
jest.mock('../../../src/config/prisma.js', () => ({
    prisma: {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}))

describe('🔐 auth.repository Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    // ---------------- CREATE USER ----------------
    describe('createUser', () => {
        it('✅ should create a new user successfully', async () => {
            const fakeUser = {
                id: 1,
                name: 'Tiswan',
                email: 'tiswan@example.com',
                password: 'hashed123',
                role: 'USER',
            }

            prisma.user.create.mockResolvedValue(fakeUser)

            const result = await createUser({
                name: 'Tiswan',
                email: 'tiswan@example.com',
                password: 'hashed123',
                role: 'USER',
            })

            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    name: 'Tiswan',
                    email: 'tiswan@example.com',
                    password: 'hashed123',
                    role: 'USER',
                },
            })
            expect(result).toEqual(fakeUser)
        })
    })

    // ---------------- FIND USER BY EMAIL ----------------
    describe('findUserByEmail', () => {
        it('✅ should return user if found', async () => {
            const fakeUser = {
                id: 1,
                email: 'tiswan@example.com',
                name: 'Tiswan',
            }

            prisma.user.findUnique.mockResolvedValue(fakeUser)

            const result = await findUserByEmail('tiswan@example.com')

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'tiswan@example.com' },
            })
            expect(result).toEqual(fakeUser)
        })

        it('🚫 should return null if user not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null)

            const result = await findUserByEmail('notfound@example.com')

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'notfound@example.com' },
            })
            expect(result).toBeNull()
        })
    })
})
