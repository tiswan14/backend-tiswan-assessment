import request from 'supertest'
import app from '../../src/app.js'
import { prisma } from '../../src/config/prisma.js'
import dotenv from 'dotenv'

if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: '.env.test' })
} else {
    dotenv.config()
}

export const api = request(app)

beforeAll(async () => {
    // 🧹 Bersihkan database test sebelum mulai
    await prisma.attachment.deleteMany()
    await prisma.task.deleteMany()
    await prisma.refreshToken.deleteMany()
    await prisma.user.deleteMany()
})

afterAll(async () => {
    await prisma.$disconnect()
})
