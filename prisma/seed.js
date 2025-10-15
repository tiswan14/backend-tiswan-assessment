import { PrismaClient } from '@prisma/client'
import { seedUsers } from './seed/users.js'
import { seedTasks } from './seed/tasks.js'
import { seedAttachments } from './seed/attachments.js'
import { seedRefreshTokens } from './seed/refreshTokens.js'

const prisma = new PrismaClient()

async function main() {
    try {
        // const users = await seedUsers()
        // const tasks = await seedTasks()
        // const attachments = await seedAttachments()
        const refreshTokens = await seedRefreshTokens()
    } catch (error) {
        console.error('❌ Error seeding data:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
