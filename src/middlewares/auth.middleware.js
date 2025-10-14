import jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma.js'

const JWT_SECRET = process.env.JWT_SECRET

export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return next({
            status: 401,
            message: 'Access denied. No token provided.',
        })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET)

        const existingSession = await prisma.refreshToken.findFirst({
            where: { user_id: decoded.userId },
        })

        if (!existingSession) {
            return next({
                status: 401,
                message: 'Session expired or user logged out.',
            })
        }

        req.user = decoded
        next()
    } catch (error) {
        if (
            error.name === 'TokenExpiredError' ||
            error.name === 'JsonWebTokenError'
        ) {
            return next({
                status: 403,
                message: 'Invalid or expired token.',
            })
        }
        next(error)
    }
}
