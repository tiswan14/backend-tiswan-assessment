import { jest } from '@jest/globals'
import {
    getAllUsers,
    getUserByIdService,
    deleteUser,
} from '../../../src/services/user.service.js'

import * as userRepo from '../../../src/repositories/user.repository.js'
import {
    NotFoundError,
    ForbiddenError,
} from '../../../src/errors/constum.error.js'

// 🧪 Mock repository
jest.mock('../../../src/repositories/user.repository.js', () => ({
    findAllUsers: jest.fn(),
    findUserById: jest.fn(),
    deleteUserById: jest.fn(),
}))

describe('👤 userService Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    // ---------------- getAllUsers ----------------
    describe('getAllUsers', () => {
        it('✅ should return all users successfully', async () => {
            const mockUsers = [
                { id: '1', name: 'User 1' },
                { id: '2', name: 'User 2' },
            ]
            userRepo.findAllUsers.mockResolvedValue(mockUsers)

            const result = await getAllUsers()

            expect(userRepo.findAllUsers).toHaveBeenCalled()
            expect(result).toEqual(mockUsers)
        })
    })

    // ---------------- getUserByIdService ----------------
    describe('getUserByIdService', () => {
        it('✅ should return user when found', async () => {
            const mockUser = { id: '1', role: 'USER' }
            userRepo.findUserById.mockResolvedValue(mockUser)

            const result = await getUserByIdService('1', 'ADMIN')

            expect(userRepo.findUserById).toHaveBeenCalledWith('1')
            expect(result).toEqual(mockUser)
        })

        it('🚫 should throw NotFoundError when user not found', async () => {
            userRepo.findUserById.mockResolvedValue(null)

            await expect(getUserByIdService('99', 'ADMIN')).rejects.toThrow(
                NotFoundError
            )
            await expect(getUserByIdService('99', 'ADMIN')).rejects.toThrow(
                'User not found.'
            )
        })

        it('🚫 should throw ForbiddenError when MANAGER tries to view ADMIN', async () => {
            const mockUser = { id: '2', role: 'ADMIN' }
            userRepo.findUserById.mockResolvedValue(mockUser)

            await expect(getUserByIdService('2', 'MANAGER')).rejects.toThrow(
                ForbiddenError
            )
            await expect(getUserByIdService('2', 'MANAGER')).rejects.toThrow(
                'Managers cannot view Admin details.'
            )
        })
    })

    // ---------------- deleteUser ----------------
    describe('deleteUser', () => {
        it('✅ should delete user successfully when found', async () => {
            const mockUser = { id: '1', name: 'User 1' }
            userRepo.findUserById.mockResolvedValue(mockUser)
            userRepo.deleteUserById.mockResolvedValue(true)

            const result = await deleteUser('1')

            expect(userRepo.findUserById).toHaveBeenCalledWith('1')
            expect(userRepo.deleteUserById).toHaveBeenCalledWith('1')
            expect(result).toBe(true)
        })

        it('🚫 should throw NotFoundError when user not found', async () => {
            userRepo.findUserById.mockResolvedValue(null)

            await expect(deleteUser('404')).rejects.toThrow(NotFoundError)
            await expect(deleteUser('404')).rejects.toThrow('User not found.')
        })
    })
})
