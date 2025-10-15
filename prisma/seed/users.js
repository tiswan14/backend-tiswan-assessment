import { PrismaClient, Role } from '@prisma/client'
const prisma = new PrismaClient()

export async function seedUsers() {
    console.log('Seeding Users...')
    try {
        const admin = await prisma.user.create({
            data: {
                name: 'Admin',
                email: 'admin@example.com',
                password: 'hashedpw',
                role: Role.ADMIN,
            },
        })
        const manager = await prisma.user.create({
            data: {
                name: 'Manager',
                email: 'manager@example.com',
                password: 'hashedpw',
                role: Role.MANAGER,
            },
        })
        const user = await prisma.user.create({
            data: {
                name: 'User',
                email: 'user@example.com',
                password: 'hashedpw',
                role: Role.USER,
            },
        })
        console.log('✅ Users seeded successfully!')
        return { admin, manager, user }
    } catch (error) {
        console.error('❌ Error seeding Users:', error)
        throw error
    }
}
