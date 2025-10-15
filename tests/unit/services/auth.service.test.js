import { jest } from '@jest/globals'
import { authService } from '../../../src/services/auth.service.js'
import * as authRepo from '../../../src/repositories/auth.repository.js'
import * as hashUtils from '../../../src/utils/hash.js'
import * as tokenUtils from '../../../src/utils/token.js'
import * as refreshRepo from '../../../src/repositories/refreshToken.repository.js'
import { prisma } from '../../../src/config/prisma.js'
import jwt from 'jsonwebtoken'

// 🧩 Mock semua module
jest.mock('../../../src/repositories/auth.repository.js')
jest.mock('../../../src/repositories/refreshToken.repository.js')
jest.mock('../../../src/utils/hash.js')
jest.mock('../../../src/utils/token.js')
jest.mock('../../../src/config/prisma.js', () => ({
    prisma: {
        refreshToken: {
            findFirst: jest.fn(),
        },
    },
}))

describe('🧠 authService Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    // ---------------- REGISTER ----------------
    describe('registerUser', () => {
        it('✅ should register a new user successfully', async () => {
            authRepo.findUserByEmail.mockResolvedValue(null)
            hashUtils.hashPassword.mockResolvedValue('hashed123')
            const mockUser = { id: '1', email: 'test@mail.com' }
            authRepo.createUser.mockResolvedValue(mockUser)

            const result = await authService.registerUser({
                name: 'Test',
                email: 'test@mail.com',
                password: '12345',
                role: 'USER',
            })

            expect(authRepo.findUserByEmail).toHaveBeenCalledWith(
                'test@mail.com'
            )
            expect(hashUtils.hashPassword).toHaveBeenCalledWith('12345')
            expect(authRepo.createUser).toHaveBeenCalled()
            expect(result).toEqual(mockUser)
        })

        it('🚫 should throw error if email already in use', async () => {
            authRepo.findUserByEmail.mockResolvedValue({ id: '1' })

            await expect(
                authService.registerUser({
                    name: 'Test',
                    email: 'used@mail.com',
                    password: '12345',
                    role: 'USER',
                })
            ).rejects.toThrow('Email already in use')
        })
    })

    // ---------------- LOGIN ----------------
    describe('loginUser', () => {
        it('✅ should login successfully and return tokens', async () => {
            const mockUser = {
                id: '1',
                email: 'user@mail.com',
                password: 'hashed',
                role: 'USER',
            }
            authRepo.findUserByEmail.mockResolvedValue(mockUser)
            hashUtils.comparePassword.mockResolvedValue(true)
            tokenUtils.generateAccessToken.mockReturnValue('access-token')
            tokenUtils.generateRefreshToken.mockReturnValue('refresh-token')
            refreshRepo.createRefreshToken.mockResolvedValue(true)

            const result = await authService.loginUser({
                email: 'user@mail.com',
                password: '12345',
            })

            expect(authRepo.findUserByEmail).toHaveBeenCalledWith(
                'user@mail.com'
            )
            expect(hashUtils.comparePassword).toHaveBeenCalledWith(
                '12345',
                'hashed'
            )
            expect(result).toHaveProperty('accessToken', 'access-token')
            expect(result).toHaveProperty('refreshToken', 'refresh-token')
        })

        it('🚫 should throw error if email not found', async () => {
            authRepo.findUserByEmail.mockResolvedValue(null)

            await expect(
                authService.loginUser({
                    email: 'notfound@mail.com',
                    password: '123',
                })
            ).rejects.toThrow('Invalid email or password.')
        })

        it('🚫 should throw error if password is invalid', async () => {
            const mockUser = { id: '1', password: 'hashed' }
            authRepo.findUserByEmail.mockResolvedValue(mockUser)
            hashUtils.comparePassword.mockResolvedValue(false)

            await expect(
                authService.loginUser({
                    email: 'user@mail.com',
                    password: 'wrong',
                })
            ).rejects.toThrow('Invalid email or password.')
        })
    })

    // ---------------- LOGOUT ----------------
    describe('logoutUser', () => {
        it('✅ should delete refresh tokens successfully', async () => {
            refreshRepo.deleteRefreshTokensByUserId.mockResolvedValue(true)

            const result = await authService.logoutUser('1')

            expect(
                refreshRepo.deleteRefreshTokensByUserId
            ).toHaveBeenCalledWith('1')
            expect(result).toEqual({ message: 'Logout successful' })
        })
    })

    // ---------------- REFRESH TOKEN ----------------
    describe('refreshToken', () => {
        it('✅ should refresh token successfully', async () => {
            const mockStoredToken = {
                token: 'refresh-token',
                expires_at: new Date(Date.now() + 86400000),
                user: { id: '1', email: 'user@mail.com', role: 'USER' },
            }
            prisma.refreshToken.findFirst.mockResolvedValue(mockStoredToken)
            jest.spyOn(jwt, 'sign').mockReturnValue('new-access-token')

            const result = await authService.refreshToken('refresh-token')

            expect(prisma.refreshToken.findFirst).toHaveBeenCalledWith({
                where: { token: 'refresh-token' },
                include: { user: true },
            })
            expect(result).toEqual({ accessToken: 'new-access-token' })
        })

        it('🚫 should throw error if token not provided', async () => {
            await expect(authService.refreshToken()).rejects.toThrow(
                'Refresh token is required'
            )
        })

        it('🚫 should throw error if token invalid', async () => {
            prisma.refreshToken.findFirst.mockResolvedValue(null)
            await expect(authService.refreshToken('invalid')).rejects.toThrow(
                'Invalid refresh token'
            )
        })

        it('🚫 should throw error if token expired', async () => {
            prisma.refreshToken.findFirst.mockResolvedValue({
                token: 'expired',
                expires_at: new Date(Date.now() - 10000),
                user: { id: '1', email: 'user@mail.com', role: 'USER' },
            })
            await expect(authService.refreshToken('expired')).rejects.toThrow(
                'Refresh token expired'
            )
        })

        it('🚫 should throw error if user not found', async () => {
            prisma.refreshToken.findFirst.mockResolvedValue({
                token: 'no-user',
                expires_at: new Date(Date.now() + 10000),
                user: null,
            })
            await expect(authService.refreshToken('no-user')).rejects.toThrow(
                'User not found'
            )
        })
    })
})
