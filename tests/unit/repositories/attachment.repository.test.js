import { jest } from '@jest/globals'
import { prisma } from '../../../src/config/prisma.js'
import {
    createAttachment,
    deleteAttachment,
    getAttachmentById,
    getAttachmentsByTaskId,
} from '../../../src/repositories/attachment.repository.js'

jest.mock('../../../src/config/prisma.js', () => ({
    prisma: {
        attachment: {
            create: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
    },
}))

describe('📎 attachment.repository Unit Tests', () => {
    afterEach(() => jest.clearAllMocks())

    it('✅ should create attachment successfully', async () => {
        const mockData = { id: 1, file_name: 'file.pdf' }
        prisma.attachment.create.mockResolvedValue(mockData)

        const result = await createAttachment({ file_name: 'file.pdf' })

        expect(prisma.attachment.create).toHaveBeenCalledWith({
            data: { file_name: 'file.pdf' },
            include: expect.any(Object),
        })
        expect(result).toEqual(mockData)
    })

    it('✅ should delete attachment by id', async () => {
        prisma.attachment.delete.mockResolvedValue(true)
        const result = await deleteAttachment(1)

        expect(prisma.attachment.delete).toHaveBeenCalledWith({
            where: { id: 1 },
        })
        expect(result).toBe(true)
    })

    it('✅ should find attachment by id', async () => {
        const mockAttachment = { id: 1, task: { id: 5 } }
        prisma.attachment.findUnique.mockResolvedValue(mockAttachment)

        const result = await getAttachmentById(1)

        expect(prisma.attachment.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            include: expect.any(Object),
        })
        expect(result).toEqual(mockAttachment)
    })

    it('✅ should get attachments by task id', async () => {
        const mockData = [{ id: 1 }, { id: 2 }]
        prisma.attachment.findMany.mockResolvedValue(mockData)

        const result = await getAttachmentsByTaskId(5)

        expect(prisma.attachment.findMany).toHaveBeenCalledWith({
            where: { task_id: 5 },
        })
        expect(result).toEqual(mockData)
    })
})
