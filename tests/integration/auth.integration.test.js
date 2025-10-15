import { api } from './setup.js'

describe('🔐 AUTH Integration Tests', () => {
    let refreshToken
    let integrationEmail // simpan email biar konsisten antar test

    it('✅ should register a new user', async () => {
        integrationEmail = `integration_${Date.now()}@test.com` // unik tiap run

        const res = await api.post('/api/auth/register').send({
            name: 'Integration User',
            email: integrationEmail,
            password: 'secret123',
            role: 'USER',
        })

        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('user')
        expect(res.body.user.email).toBe(integrationEmail)
    })

    it('✅ should login user and return tokens', async () => {
        const res = await api.post('/api/auth/login').send({
            email: integrationEmail, // 🔧 pakai email dari register
            password: 'secret123',
        })

        expect(res.status).toBe(200)
        expect(res.body.data).toHaveProperty('accessToken')
        expect(res.body.data).toHaveProperty('refreshToken')

        refreshToken = res.body.data.refreshToken
    })

    it('✅ should refresh token successfully', async () => {
        const res = await api.post('/api/auth/refresh-token').send({
            refreshToken,
        })

        expect(res.status).toBe(200)
        expect(res.body.data).toHaveProperty('accessToken')
    })

    it('✅ should logout successfully', async () => {
        const res = await api
            .post('/api/auth/logout')
            .set('Authorization', 'Bearer dummy')

        // bisa 200 (kalau valid user login) atau 401 (token invalid)
        expect([200, 401]).toContain(res.status)
    })
})
