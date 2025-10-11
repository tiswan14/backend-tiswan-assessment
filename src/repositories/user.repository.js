import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function findUserById(userId) {
    return await prisma.user.findUnique({
        where: {
            id: userId,
        },
    })
}
