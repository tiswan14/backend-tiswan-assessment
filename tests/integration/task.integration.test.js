/**
 * @fileoverview Integration Tests for Task Routes
 * Covers: create, getAll, getById, update, delete
 */

import request from 'supertest'
import app from '../../src/app.js'
import { prisma } from '../../src/config/prisma.js'
import jwt from 'jsonwebtoken'

const JWT_SECRET =
    process.env.JWT_SECRET ||
    process.env.JWT_ACCESS_SECRET ||
    'super-secret-key'

// Dummy users
let adminUser, managerUser, normalUser
let adminToken, managerToken, normalToken
let createdTaskId

beforeAll(async () => {
    // Bersihkan data agar tidak bentrok
    await prisma.$transaction([
        prisma.attachment.deleteMany(),
        prisma.task.deleteMany(),
        prisma.user.deleteMany(),
    ])

    // Buat user
    adminUser = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'hashedpassword',
            role: 'ADMIN',
        },
    })

    managerUser = await prisma.user.create({
        data: {
            name: 'Manager User',
            email: 'manager@example.com',
            password: 'hashedpassword',
            role: 'MANAGER',
        },
    })

    normalUser = await prisma.user.create({
        data: {
            name: 'Normal User',
            email: 'user@example.com',
            password: 'hashedpassword',
            role: 'USER',
        },
    })

    // Generate JWT Token
    adminToken = jwt.sign(
        { userId: adminUser.id, role: adminUser.role },
        JWT_SECRET
    )
    managerToken = jwt.sign(
        { userId: managerUser.id, role: managerUser.role },
        JWT_SECRET
    )
    normalToken = jwt.sign(
        { userId: normalUser.id, role: normalUser.role },
        JWT_SECRET
    )
})

afterAll(async () => {
    await prisma.$disconnect()
})

describe('🧪 TASK Integration Tests', () => {
    // ✅ CREATE TASK
    it('✅ should create a new task by ADMIN', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                title: 'Integration Task 1',
                description: 'Test integration task',
                due_date: new Date().toISOString(),
                assigned_to_id: managerUser.id,
            })

        expect(res.statusCode).toBe(201)
        expect(res.body.success).toBe(true)
        expect(res.body.data).toHaveProperty('id')

        createdTaskId = res.body.data.id
    })

    it('❌ should forbid USER from creating a task', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${normalToken}`)
            .send({
                title: 'User Task',
                description: 'Should not work',
                due_date: new Date().toISOString(),
            })

        expect(res.statusCode).toBe(403)
    })

    // ✅ GET ALL TASKS
    it('✅ should fetch all tasks', async () => {
        const res = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${adminToken}`)

        expect(res.statusCode).toBe(200)
        expect(Array.isArray(res.body.data)).toBe(true)
    })

    // ✅ GET TASK BY ID
    it('✅ should get a task by ID', async () => {
        const res = await request(app)
            .get(`/api/tasks/${createdTaskId}`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(res.statusCode).toBe(200)
        expect(res.body.data).toHaveProperty('id', createdTaskId)
    })

    it('❌ should return 404 if task not found', async () => {
        const res = await request(app)
            .get('/api/tasks/unknown-id')
            .set('Authorization', `Bearer ${adminToken}`)

        expect(res.statusCode).toBe(404)
    })

    // ✅ UPDATE TASK
    it('✅ should update task successfully by ADMIN', async () => {
        const res = await request(app)
            .patch(`/api/tasks/${createdTaskId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                title: 'Updated Task Title',
                status: 'IN_PROGRESS',
            })

        expect(res.statusCode).toBe(200)
        expect(res.body.data.title).toBe('Updated Task Title')
    })

    it('❌ should not allow USER to update task', async () => {
        const res = await request(app)
            .patch(`/api/tasks/${createdTaskId}`)
            .set('Authorization', `Bearer ${normalToken}`)
            .send({
                title: 'Should not work',
            })

        expect(res.statusCode).toBe(403)
    })

    // ✅ DELETE TASK
    it('✅ should delete task by ADMIN', async () => {
        const res = await request(app)
            .delete(`/api/tasks/${createdTaskId}`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(res.statusCode).toBe(200)
        expect(res.body.message).toBe('Task deleted successfully')
    })

    it('❌ should not allow USER to delete task', async () => {
        const res = await request(app)
            .delete(`/api/tasks/${createdTaskId}`)
            .set('Authorization', `Bearer ${normalToken}`)

        expect([403, 404]).toContain(res.statusCode)
    })
})
