import { PrismaClient, Role } from '@prisma/client'
import { hashPassword } from '../utils/hash.js'

const prisma = new PrismaClient()

export async function createUser({ name, email, password, role = Role.USER }) {
    const hashedPassword = await hashPassword(password)
    return await prisma.user.create({
        data: { name, email, password: hashedPassword, role },
    })
}

export async function findUserByEmail(email) {
    return await prisma.user.findUnique({ where: { email } })
}
