import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

export async function createUser({ name, email, password, role }) {
    return await prisma.user.create({
        data: { name, email, password, role },
    })
}

export async function findUserByEmail(email) {
    return await prisma.user.findUnique({ where: { email } })
}
