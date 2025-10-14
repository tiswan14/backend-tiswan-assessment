import { prisma } from '../config/prisma.js'

export async function findAllUsers() {
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            created_at: true,
        },
        orderBy: { created_at: 'desc' },
    })
}

export async function findUserById(userId) {
    return await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            created_at: true,
        },
    })
}

export async function deleteUserById(userId) {
    return await prisma.user.delete({
        where: { id: userId },
        select: { id: true, email: true },
    })
}
