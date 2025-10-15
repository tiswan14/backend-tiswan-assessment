import request from 'supertest'
import { expect } from 'chai'
import app from '../../src/app.js'
import { prisma } from '../../src/config/prisma.js'

describe('🔐 Auth Integration Tests (Mocha + Chai)', function () {
    this.timeout(10000)

    before(async () => {
        await prisma.$transaction([
            prisma.refreshToken.deleteMany(),
            prisma.user.deleteMany(),
        ])
    })

    after(async () => {
        await prisma.$disconnect()
    })

    const userData = {
        name: 'Integration User',
        email: 'integration@test.com',
        password: 'password123',
        role: 'USER',
    }

    // =============================
    // ✅ REGISTER USER
    // =============================
    it('✅ POST /api/auth/register - should register a new user', async () => {
        const res = await request(app).post('/api/auth/register').send(userData)

        expect(res.status).to.equal(201)
        expect(res.body).to.have.property(
            'message',
            'User created successfully'
        )
        expect(res.body.user).to.have.property('email', userData.email)
    })

    it('❌ POST /api/auth/register - should fail if email already exists', async () => {
        const res = await request(app).post('/api/auth/register').send(userData)

        expect(res.status).to.equal(409)
        expect(res.body.message).to.contain('already in use')
    })

    // =============================
    // ✅ LOGIN USER
    // =============================
    it('✅ POST /api/auth/login - should login successfully', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: userData.email, password: userData.password })

        expect(res.status).to.equal(200)
        expect(res.body).to.have.property('success', true)
        expect(res.body.data).to.have.property('accessToken')
        expect(res.body.data).to.have.property('refreshToken')
    })

    it('❌ POST /api/auth/login - should fail with invalid password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: userData.email, password: 'wrongpass' })

        expect(res.status).to.equal(401)
        expect(res.body.message).to.contain('Invalid email or password')
    })

    // =============================
    // ✅ REFRESH TOKEN
    // =============================
    it('✅ POST /api/auth/refresh-token - should refresh access token', async () => {
        // Login dulu untuk mendapatkan refresh token baru
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: userData.email, password: userData.password })

        const refreshToken = loginRes.body.data.refreshToken

        const res = await request(app)
            .post('/api/auth/refresh-token')
            .send({ refreshToken })

        expect(res.status).to.equal(200)
        expect(res.body).to.have.property('success', true)
        expect(res.body.data).to.have.property('accessToken')
    })

    it('❌ POST /api/auth/refresh-token - should fail with invalid token', async () => {
        const res = await request(app)
            .post('/api/auth/refresh-token')
            .send({ refreshToken: 'invalidtoken123' })

        expect(res.status).to.equal(401)
        expect(res.body.message).to.contain('Invalid refresh token')
    })

    // =============================
    // ✅ LOGOUT USER
    // =============================
    it('✅ POST /api/auth/logout - should logout successfully', async () => {
        // Login dulu untuk mendapatkan token baru yang fresh
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: userData.email, password: userData.password })

        const accessToken = loginRes.body.data.accessToken
        console.log('Access Token untuk logout:', accessToken) // Debug

        const res = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${accessToken}`)

        console.log('Logout response status:', res.status) // Debug
        console.log('Logout response body:', res.body) // Debug

        expect(res.status).to.equal(200)
        expect(res.body).to.have.property('success', true)
        expect(res.body).to.have.property('message', 'Logout successful')
    })

    it('❌ POST /api/auth/logout - should fail if no token provided', async () => {
        const res = await request(app).post('/api/auth/logout')

        expect(res.status).to.equal(401)
        expect(res.body.message).to.contain('Access denied')
    })
})
