import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createRefreshToken(userId, token, expiresAt) {
    return await prisma.refreshToken.create({
        data: {
            user_id: userId,
            token,
            expires_at: expiresAt,
        },
    })
}

export async function findRefreshToken(token) {
    return await prisma.refreshToken.findUnique({
        where: { token },
    })
}

export async function deleteRefreshToken(token) {
    return await prisma.refreshToken.delete({
        where: { token },
    })
}
