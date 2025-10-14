import request from 'supertest'
import app from '../../src/app.js'
import { prisma } from '../../src/config/prisma.js'

let adminToken
let userToken
let createdTask

describe('🧩 Task Integration Tests', () => {
    beforeAll(async () => {
        jest.setTimeout(40000)
        console.log('🧹 Cleaning database...')

        // Hapus dalam urutan aman (biar gak FK error)
        await prisma.attachment.deleteMany()
        await prisma.task.deleteMany()
        await prisma.refreshToken.deleteMany()
        await prisma.user.deleteMany()

        // 🔐 Register Admin
        console.log('🧑‍💼 Registering ADMIN...')
        await request(app).post('/api/auth/register').send({
            name: 'Admin Tester',
            email: 'admin@example.com',
            password: 'password123',
            role: 'ADMIN',
        })

        // 🔑 Login Admin
        const adminLogin = await request(app).post('/api/auth/login').send({
            email: 'admin@example.com',
            password: 'password123',
        })

        adminToken =
            adminLogin.body.accessToken ||
            adminLogin.body.data?.accessToken ||
            adminLogin.body.token ||
            null

        if (!adminToken) {
            console.error('❌ Admin login response:', adminLogin.body)
            throw new Error('❌ Admin token not generated')
        }

        // 👤 Register User
        console.log('👤 Registering USER...')
        await request(app).post('/api/auth/register').send({
            name: 'User Tester',
            email: 'user@example.com',
            password: 'password123',
            role: 'USER',
        })

        // 🔑 Login User
        const userLogin = await request(app).post('/api/auth/login').send({
            email: 'user@example.com',
            password: 'password123',
        })

        userToken =
            userLogin.body.accessToken ||
            userLogin.body.data?.accessToken ||
            userLogin.body.token ||
            null

        if (!userToken) {
            console.error('❌ User login response:', userLogin.body)
            throw new Error('❌ User token not generated')
        }

        console.log('✅ Setup complete!')
    }, 40000)

    afterAll(async () => {
        await prisma.$disconnect()
    })

    // ✅ CREATE TASK
    test('✅ POST /api/tasks - should create a new task (ADMIN only)', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                title: 'Integration Test Task',
                description: 'Task created for integration testing',
                due_date: new Date(Date.now() + 86400000),
                priority: 'HIGH',
            })

        console.log('🧩 CREATE TASK RESPONSE:', res.body)

        expect(res.statusCode).toBe(201)
        expect(res.body).toHaveProperty('success', true)
        expect(res.body).toHaveProperty('message', 'Task created successfully')
        // ✅ fix nested data (karena ada 3 level)
        expect(res.body.data.data).toHaveProperty(
            'title',
            'Integration Test Task'
        )

        createdTask = res.body.data.data
    }, 20000)

    // 📋 GET ALL TASKS
    test('📋 GET /api/tasks - should return all tasks', async () => {
        const res = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${adminToken}`)

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('success', true)
        expect(Array.isArray(res.body.data)).toBe(true)
        expect(res.body.data.length).toBeGreaterThan(0)
    })

    // 🔍 GET TASK BY ID
    test('🔍 GET /api/tasks/:id - should return task by ID', async () => {
        if (!createdTask) throw new Error('❌ createdTask not set')

        const res = await request(app)
            .get(`/api/tasks/${createdTask.id}`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('success', true)
        expect(res.body.data).toHaveProperty('id', createdTask.id)
    })

    // ✏️ UPDATE TASK (ADMIN)
    test('✏️ PATCH /api/tasks/:id - should update task (ADMIN)', async () => {
        if (!createdTask) throw new Error('❌ createdTask not set')

        const res = await request(app)
            .patch(`/api/tasks/${createdTask.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                title: 'Updated Integration Task',
                priority: 'LOW',
            })

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('success', true)
        expect(res.body.data).toHaveProperty(
            'title',
            'Updated Integration Task'
        )
    })

    // 🚫 DELETE TASK (USER forbidden)
    test('🚫 DELETE /api/tasks/:id - should forbid deletion by USER', async () => {
        if (!createdTask) throw new Error('❌ createdTask not set')

        const res = await request(app)
            .delete(`/api/tasks/${createdTask.id}`)
            .set('Authorization', `Bearer ${userToken}`)

        expect(res.statusCode).toBe(403)
        expect(res.body.message).toMatch(/Access denied/i)
    })

    // 🗑️ DELETE TASK (ADMIN success)
    test('🗑️ DELETE /api/tasks/:id - should delete task successfully (ADMIN)', async () => {
        if (!createdTask) throw new Error('❌ createdTask not set')

        const res = await request(app)
            .delete(`/api/tasks/${createdTask.id}`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('success', true)
        expect(res.body).toHaveProperty('message', 'Task deleted successfully')
    })
})
