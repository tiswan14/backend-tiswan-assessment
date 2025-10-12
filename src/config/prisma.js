// src/config/prisma.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
})

async function testConnection() {
    try {
        await prisma.$queryRaw`SELECT 1`
        console.log('✅ Database connected successfully!')
    } catch (err) {
        console.error('❌ Database connection failed!')
        console.error('Error message:', err.message)
        console.error('Stack trace:', err.stack)
        process.exit(1)
    }
}

if (process.env.NODE_ENV !== 'test') {
    testConnection()
}

export { prisma }
