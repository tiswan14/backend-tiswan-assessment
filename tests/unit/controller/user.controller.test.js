import { jest } from '@jest/globals'
import {
    getAllUsersController,
    getUserByIdController,
    deleteUserController,
} from '../../../src/controllers/user.controller.js'

import * as userService from '../../../src/services/user.service.js'

// 🧠 Mock semua fungsi service
jest.mock('../../../src/services/user.service.js', () => ({
    getAllUsers: jest.fn(),
    getUserByIdService: jest.fn(),
    deleteUser: jest.fn(),
}))

describe('👥 User Controller Unit Tests', () => {
    let req, res, next

    beforeEach(() => {
        req = { params: {}, body: {} }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }
        next = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    // ---------------- GET ALL USERS ----------------
    describe('getAllUsersController', () => {
        it('✅ should return all users successfully', async () => {
            const mockUsers = [
                { id: '1', name: 'User 1' },
                { id: '2', name: 'User 2' },
            ]
            userService.getAllUsers.mockResolvedValue(mockUsers)

            await getAllUsersController(req, res, next)

            expect(userService.getAllUsers).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Users retrieved successfully',
                count: mockUsers.length,
                data: mockUsers,
            })
        })

        it('🚫 should call next on error', async () => {
            const error = new Error('Database error')
            userService.getAllUsers.mockRejectedValue(error)

            await getAllUsersController(req, res, next)

            expect(next).toHaveBeenCalledWith(error)
        })
    })

    // ---------------- GET USER BY ID ----------------
    describe('getUserByIdController', () => {
        it('✅ should return user successfully', async () => {
            const mockUser = { id: '1', name: 'Tiswan' }
            req.params.id = '1'
            userService.getUserByIdService.mockResolvedValue(mockUser)

            await getUserByIdController(req, res, next)

            expect(userService.getUserByIdService).toHaveBeenCalledWith('1')
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'User retrieved successfully',
                data: mockUser,
            })
        })

        it('🚫 should call next on error', async () => {
            const error = new Error('User not found')
            req.params.id = '1'
            userService.getUserByIdService.mockRejectedValue(error)

            await getUserByIdController(req, res, next)

            expect(next).toHaveBeenCalledWith(error)
        })
    })

    // ---------------- DELETE USER ----------------
    describe('deleteUserController', () => {
        it('✅ should delete user successfully', async () => {
            const mockResult = { success: true }
            req.params.id = '1'
            userService.deleteUser.mockResolvedValue(mockResult)

            await deleteUserController(req, res, next)

            expect(userService.deleteUser).toHaveBeenCalledWith('1')
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'User deleted successfully',
                data: mockResult,
            })
        })

        it('🚫 should call next on error', async () => {
            const error = new Error('Delete failed')
            req.params.id = '1'
            userService.deleteUser.mockRejectedValue(error)

            await deleteUserController(req, res, next)

            expect(next).toHaveBeenCalledWith(error)
        })
    })
})
