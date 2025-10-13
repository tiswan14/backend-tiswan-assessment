// tests/services/auth.service.test.js
import { authService } from '../../src/services/auth.service.js'
import * as authRepo from '../../src/repositories/auth.repository.js'
import * as hashUtils from '../../src/utils/hash.js'
import * as tokenUtils from '../../src/utils/token.js'
import * as refreshRepo from '../../src/repositories/refreshToken.repository.js'

// path mock harus sama dengan src, bukan ../src
jest.mock('../../src/repositories/auth.repository.js')
jest.mock('../../src/utils/hash.js')
jest.mock('../../src/utils/token.js')
jest.mock('../../src/repositories/refreshToken.repository.js')

describe('authService', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('registerUser', () => {
        it('should throw error if email already exists', async () => {
            authRepo.findUserByEmail.mockResolvedValue({
                id: 'user1',
                email: 'test@mail.com',
            })

            await expect(
                authService.registerUser({
                    name: 'Test',
                    email: 'test@mail.com',
                    password: '123',
                    role: 'USER',
                })
            ).rejects.toThrow('Email already in use')
        })

        it('should register new user successfully', async () => {
            authRepo.findUserByEmail.mockResolvedValue(null)
            hashUtils.hashPassword.mockResolvedValue('hashedPassword')
            authRepo.createUser.mockResolvedValue({
                id: 'user1',
                name: 'Test',
                email: 'test@mail.com',
                role: 'USER',
            })

            const user = await authService.registerUser({
                name: 'Test',
                email: 'test@mail.com',
                password: '123',
                role: 'USER',
            })

            expect(user).toEqual({
                id: 'user1',
                name: 'Test',
                email: 'test@mail.com',
                role: 'USER',
            })
            expect(hashUtils.hashPassword).toHaveBeenCalledWith('123')
            expect(authRepo.createUser).toHaveBeenCalledWith({
                name: 'Test',
                email: 'test@mail.com',
                password: 'hashedPassword',
                role: 'USER',
            })
        })
    })

    describe('loginUser', () => {
        it('should throw error if email not found', async () => {
            authRepo.findUserByEmail.mockResolvedValue(null)

            await expect(
                authService.loginUser({
                    email: 'test@mail.com',
                    password: '123',
                })
            ).rejects.toThrow('Invalid email or password.')
        })

        it('should throw error if password invalid', async () => {
            authRepo.findUserByEmail.mockResolvedValue({
                id: 'user1',
                email: 'test@mail.com',
                password: 'hashedPassword',
                role: 'USER',
            })
            hashUtils.comparePassword.mockResolvedValue(false)

            await expect(
                authService.loginUser({
                    email: 'test@mail.com',
                    password: 'wrongpass',
                })
            ).rejects.toThrow('Invalid email or password.')
        })

        it('should return accessToken and refreshToken if login success', async () => {
            authRepo.findUserByEmail.mockResolvedValue({
                id: 'user1',
                email: 'test@mail.com',
                password: 'hashedPassword',
                role: 'USER',
            })
            hashUtils.comparePassword.mockResolvedValue(true)
            tokenUtils.generateAccessToken.mockReturnValue('access-token')
            tokenUtils.generateRefreshToken.mockReturnValue('refresh-token')
            refreshRepo.createRefreshToken.mockResolvedValue(true)

            const result = await authService.loginUser({
                email: 'test@mail.com',
                password: '123',
            })

            expect(result).toEqual({
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
            })
            expect(refreshRepo.createRefreshToken).toHaveBeenCalled()
        })
    })
})
