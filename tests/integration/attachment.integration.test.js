import request from 'supertest'
import app from '../../src/app.js'
import { prisma } from '../../src/config/prisma.js'
import { generateAccessToken } from '../../src/utils/token.js'
import path from 'path'
import fs from 'fs'

// Mock @vercel/blob supaya tidak upload/delete ke server asli
jest.mock('@vercel/blob', () => ({
    put: jest.fn(async (path, buffer, options) => ({
        url: `https://fake-blob.vercel-storage.com/${path}`,
        pathname: path,
    })),
    del: jest.fn(async () => true),
}))

describe('📎 Attachment API Integration Tests (PDF & Image Only)', () => {
    let adminUser, assignedUser, task, adminToken, userToken
    const pdfPath = path.resolve('assets/sample.pdf')
    const txtPath = path.resolve('assets/sample.pdf')

    beforeAll(async () => {
        // Pastikan folder assets ada
        if (!fs.existsSync('assets')) fs.mkdirSync('assets')

        // Buat dummy file PDF valid
        if (!fs.existsSync(pdfPath)) {
            fs.writeFileSync(
                pdfPath,
                '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF'
            )
        }

        // Buat dummy file .txt invalid
        if (!fs.existsSync(txtPath)) {
            fs.writeFileSync(txtPath, 'Invalid text file content')
        }

        // Bersihkan semua tabel
        await prisma.$transaction([
            prisma.attachment.deleteMany(),
            prisma.task.deleteMany(),
            prisma.refreshToken.deleteMany(),
            prisma.user.deleteMany(),
        ])

        // Buat user Admin
        adminUser = await prisma.user.create({
            data: {
                name: 'Admin Attachment',
                email: 'admin-upload@test.com',
                password: 'hashedpassword',
                role: 'ADMIN',
            },
        })

        // Buat user assigned
        assignedUser = await prisma.user.create({
            data: {
                name: 'User Assigned',
                email: 'user-upload@test.com',
                password: 'hashedpassword',
                role: 'USER',
            },
        })

        // Buat Task baru
        task = await prisma.task.create({
            data: {
                title: 'Integration Upload Test',
                description: 'Testing file upload endpoint',
                status: 'TODO',
                priority: 'HIGH',
                due_date: new Date(Date.now() + 86400000),
                created_by_id: adminUser.id,
                assigned_to_id: assignedUser.id,
            },
        })

        // Generate Token
        adminToken = generateAccessToken({
            userId: adminUser.id,
            role: adminUser.role,
        })
        userToken = generateAccessToken({
            userId: assignedUser.id,
            role: assignedUser.role,
        })
    })

    afterAll(async () => {
        await prisma.$disconnect()
    })

    // ✅ Should upload PDF successfully
    test('✅ Should upload PDF file successfully', async () => {
        await prisma.task.update({
            where: { id: task.id },
            data: { status: 'TODO' },
        })

        const res = await request(app)
            .post(`/api/tasks/${task.id}/attachments`)
            .set('Authorization', `Bearer ${userToken}`)
            .attach('file', pdfPath, {
                filename: 'sample.pdf',
                contentType: 'application/pdf',
            })

        expect(res.statusCode).toBe(201)
        expect(res.body).toHaveProperty('success', true)
        expect(res.body.message).toMatch(/uploaded/i)
        expect(res.body.data.data).toHaveProperty('attachment')
        expect(res.body.data.data.attachment).toHaveProperty('file_url')
    })

    // ✅ Should delete attachment successfully by admin
    test('✅ Should delete attachment successfully by admin', async () => {
        await prisma.task.update({
            where: { id: task.id },
            data: { status: 'TODO' },
        })

        const uploadRes = await request(app)
            .post(`/api/tasks/${task.id}/attachments`)
            .set('Authorization', `Bearer ${userToken}`)
            .attach('file', pdfPath)

        const attachmentId = uploadRes.body.data.data.attachment.id
        expect(attachmentId).toBeDefined()

        const res = await request(app)
            .delete(`/api/attachments/${attachmentId}`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('success', true)
        expect(res.body.message).toMatch(/deleted successfully/i)
    })

    // 🚫 Should forbid delete by unauthorized user
    test('🚫 Should forbid delete by unauthorized user', async () => {
        await prisma.task.update({
            where: { id: task.id },
            data: { status: 'TODO' },
        })

        const uploadRes = await request(app)
            .post(`/api/tasks/${task.id}/attachments`)
            .set('Authorization', `Bearer ${userToken}`)
            .attach('file', pdfPath)

        const attachmentId = uploadRes.body.data.data.attachment.id
        expect(attachmentId).toBeDefined()

        const stranger = await prisma.user.create({
            data: {
                name: 'Stranger',
                email: 'stranger@test.com',
                password: 'hashedpassword',
                role: 'USER',
            },
        })
        const strangerToken = generateAccessToken({
            userId: stranger.id,
            role: stranger.role,
        })

        const res = await request(app)
            .delete(`/api/attachments/${attachmentId}`)
            .set('Authorization', `Bearer ${strangerToken}`)

        expect(res.statusCode).toBe(403)
        expect(res.body).toHaveProperty('success', false)
        expect(res.body.message).toMatch(/not allowed/i)
    })
})
