// src/config/prisma.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
})

// Test koneksi database saat startup
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

testConnection()

export default prisma
