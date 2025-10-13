import { prisma } from '../../src/config/prisma.js'
import {
    createAttachment,
    deleteAttachment,
    getAttachmentById,
} from '../../src/repositories/attachment.repository.js'

// Mock prisma client
jest.mock('../../src/config/prisma.js', () => ({
    prisma: {
        attachment: {
            create: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}))

describe('attachment.repository', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    // ---------------- CREATE ATTACHMENT ----------------
    describe('createAttachment', () => {
        it('should create an attachment with task included', async () => {
            const fakeAttachment = {
                id: 1,
                file_name: 'file.txt',
                task: { id: 1, title: 'Test Task' },
            }
            prisma.attachment.create.mockResolvedValue(fakeAttachment)

            const result = await createAttachment({
                file_name: 'file.txt',
                task_id: 1,
            })
            expect(result).toEqual(fakeAttachment)
            expect(prisma.attachment.create).toHaveBeenCalledWith({
                data: { file_name: 'file.txt', task_id: 1 },
                include: {
                    task: {
                        select: {
                            id: true,
                            title: true,
                            created_by: { select: { name: true } },
                            assigned_to: { select: { name: true } },
                        },
                    },
                },
            })
        })
    })

    // ---------------- DELETE ATTACHMENT ----------------
    describe('deleteAttachment', () => {
        it('should delete an attachment by id', async () => {
            const deletedAttachment = { id: 1, file_name: 'file.txt' }
            prisma.attachment.delete.mockResolvedValue(deletedAttachment)

            const result = await deleteAttachment(1)
            expect(result).toEqual(deletedAttachment)
            expect(prisma.attachment.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            })
        })
    })

    // ---------------- GET ATTACHMENT BY ID ----------------
    describe('getAttachmentById', () => {
        it('should return attachment with task details', async () => {
            const attachment = {
                id: 1,
                file_name: 'file.txt',
                task: {
                    id: 1,
                    title: 'Task 1',
                    created_by_id: 2,
                    assigned_to_id: 3,
                },
            }
            prisma.attachment.findUnique.mockResolvedValue(attachment)

            const result = await getAttachmentById(1)
            expect(result).toEqual(attachment)
            expect(prisma.attachment.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    task: {
                        select: {
                            id: true,
                            title: true,
                            created_by_id: true,
                            assigned_to_id: true,
                        },
                    },
                },
            })
        })
    })
})
