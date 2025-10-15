import jwt from 'jsonwebtoken'
import crypto from 'crypto'

export function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '24h',
    })
}

export function generateRefreshToken() {
    return crypto.randomBytes(32).toString('hex')
}

export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    } catch (error) {
        return null
    }
}
