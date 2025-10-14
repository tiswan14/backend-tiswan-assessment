import request from 'supertest'
import app from '../../src/app.js'
import { prisma } from '../../src/config/prisma.js'

describe('🔐 Auth Integration Tests', () => {
    // =============================
    // 🧹 Hapus semua data sebelum test
    // =============================
    beforeAll(async () => {
        // Urutan penting! Hapus RefreshToken dulu karena ada FK ke User
        await prisma.$transaction([
            prisma.refreshToken.deleteMany(),
            prisma.user.deleteMany(),
        ])
    })

    // Tutup koneksi Prisma setelah test
    afterAll(async () => {
        await prisma.$disconnect()
    })

    // Dummy data untuk test
    const userData = {
        name: 'Integration Test User',
        email: 'integration@test.com',
        password: 'password123',
        role: 'USER',
    }

    // =============================
    // ✅ TEST: REGISTER USER
    // =============================
    test('✅ POST /api/auth/register - should register a new user', async () => {
        const res = await request(app).post('/api/auth/register').send(userData)

        // Cek status dan struktur response
        expect(res.statusCode).toBe(201)
        expect(res.body).toHaveProperty('message', 'User created successfully')
        expect(res.body).toHaveProperty('user')
        expect(res.body.user).toHaveProperty('email', userData.email)
        expect(res.body.user).toHaveProperty('role', 'USER')

        // Pastikan user tersimpan di DB
        const userInDb = await prisma.user.findUnique({
            where: { email: userData.email },
        })
        expect(userInDb).not.toBeNull()
    })

    // =============================
    // 🔑 TEST: LOGIN USER
    // =============================
    test('🔑 POST /api/auth/login - should login and return tokens', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: userData.email,
            password: userData.password,
        })

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('success', true)
        expect(res.body).toHaveProperty('data.accessToken')
        expect(res.body).toHaveProperty('data.refreshToken')
        expect(typeof res.body.data.accessToken).toBe('string')
    })
})
