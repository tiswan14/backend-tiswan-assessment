import { prisma } from '../config/prisma.js'

export async function findUserById(userId) {
    return await prisma.user.findUnique({
        where: {
            id: userId,
        },
    })
}
