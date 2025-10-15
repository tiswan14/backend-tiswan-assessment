import { PrismaClient } from '@prisma/client'
import chalk from 'chalk'

const prisma = new PrismaClient({
    log: [],
})

if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
        console.log(
            chalk.cyanBright(`[${new Date().toLocaleTimeString()}] 🧠 QUERY:`),
            chalk.white(e.query)
        )
    })

    prisma.$on('warn', (e) => {
        console.warn(
            chalk.yellowBright(`[${new Date().toLocaleTimeString()}] ⚠️ WARN:`),
            e.message
        )
    })

    prisma.$on('error', (e) => {
        console.error(
            chalk.redBright(`[${new Date().toLocaleTimeString()}] ❌ ERROR:`),
            e.message
        )
    })
}

async function testConnection() {
    try {
        await prisma.$queryRaw`SELECT 1`
        console.log(chalk.greenBright('✅ Database connected successfully!'))
    } catch (err) {
        console.error(chalk.redBright('❌ Database connection failed!'))
        console.error(chalk.red('Error message:'), err.message)
        process.exit(1)
    }
}

if (process.env.NODE_ENV !== 'test') {
    testConnection()
}

export { prisma }
