import { findUserByEmail, createUser } from '../repositories/auth.repository.js'
import { hashPassword, comparePassword } from '../utils/hash.js'
import { generateAccessToken, generateRefreshToken } from '../utils/token.js'
import {
    createRefreshToken,
    deleteRefreshTokensByUserId,
} from '../repositories/refreshToken.repository.js'

export const authService = {
    // Fungsi registerUser
    registerUser: async ({ name, email, password, role }) => {
        const existingUser = await findUserByEmail(email)
        if (existingUser) {
            throw new Error('Email already in use')
        }

        const hashedPassword = await hashPassword(password)

        const newUser = await createUser({
            name,
            email,
            password: hashedPassword,
            role,
        })

        return newUser
    },

    //Fungsi Login User
    loginUser: async ({ email, password }) => {
        const user = await findUserByEmail(email)

        if (!user) {
            throw new Error('Invalid email or password.')
        }

        const isPasswordValid = await comparePassword(password, user.password)

        if (!isPasswordValid) {
            throw new Error('Invalid email or password.')
        }

        const accessToken = generateAccessToken({
            userId: user.id,
            role: user.role,
        })

        const refreshToken = generateRefreshToken()

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        await createRefreshToken(user.id, refreshToken, expiresAt)

        return { accessToken, refreshToken }
    },

    logoutUser: async (userId) => {
        await deleteRefreshTokensByUserId(userId)
        return { message: 'Logout successful' }
    },
    refreshToken: async (token) => {
        const jwt = await import('jsonwebtoken')
        const { prisma } = await import('../config/prisma.js')

        if (!token) throw new Error('Refresh token is required')

        const storedToken = await prisma.refreshToken.findFirst({
            where: { token },
            include: { user: true },
        })
        if (!storedToken) throw new Error('Invalid refresh token')

        if (storedToken.expires_at < new Date()) {
            throw new Error('Refresh token expired')
        }

        const user = storedToken.user
        if (!user) throw new Error('User not found')

        const newAccessToken = jwt.default.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '15m' }
        )

        return { accessToken: newAccessToken }
    },
}
