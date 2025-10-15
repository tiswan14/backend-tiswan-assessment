import { jest } from '@jest/globals'
import {
    uploadFile,
    deleteAttachmentService,
} from '../../../src/services/attachment.service.js'
import {
    ForbiddenError,
    NotFoundError,
} from '../../../src/errors/constum.error.js'
import { prisma } from '../../../src/config/prisma.js'
import { put, del } from '@vercel/blob'
import slugify from 'slugify'

// 🧠 Mock dependencies
jest.mock('../../../src/config/prisma.js', () => ({
    prisma: {
        $transaction: jest.fn(),
    },
}))
jest.mock('@vercel/blob', () => ({
    put: jest.fn(),
    del: jest.fn(),
}))
jest.mock('slugify', () => jest.fn((str) => str))

describe('📎 attachmentService Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    // ---------------- UPLOAD FILE ----------------
    describe('uploadFile', () => {
        const mockFile = {
            originalname: 'test.pdf',
            mimetype: 'application/pdf',
            buffer: Buffer.from('mock'),
        }

        it('✅ should upload file successfully and update status', async () => {
            const mockTx = {
                task: {
                    findUnique: jest.fn().mockResolvedValue({
                        id: 'task1',
                        status: 'TODO',
                        created_by: { name: 'Admin' },
                        assigned_to: { name: 'User' },
                        assigned_to_id: '2',
                    }),
                    update: jest.fn(),
                },
                attachment: {
                    create: jest
                        .fn()
                        .mockResolvedValue({ id: 'a1', file_name: 'test.pdf' }),
                },
            }

            prisma.$transaction.mockImplementation(async (cb) => cb(mockTx))
            put.mockResolvedValue({
                url: 'https://blob.url/test.pdf',
                pathname: 'test.pdf',
            })

            const result = await uploadFile(mockFile, 'task1', '2')

            expect(result.success).toBe(true)
            expect(result.data.attachment.id).toBe('a1')
            expect(result.data.new_status).toBe('IN_PROGRESS')
            expect(put).toHaveBeenCalled()
            expect(mockTx.attachment.create).toHaveBeenCalled()
        })

        it('🚫 should throw NotFoundError if task not found', async () => {
            prisma.$transaction.mockImplementation(async (cb) =>
                cb({ task: { findUnique: jest.fn().mockResolvedValue(null) } })
            )

            await expect(uploadFile(mockFile, '123', 'u1')).rejects.toThrow(
                'Task not found.'
            )
        })

        it('🚫 should throw ForbiddenError if task is DONE', async () => {
            prisma.$transaction.mockImplementation(async (cb) =>
                cb({
                    task: {
                        findUnique: jest
                            .fn()
                            .mockResolvedValue({ status: 'DONE' }),
                    },
                })
            )
            await expect(uploadFile(mockFile, 't1', 'u1')).rejects.toThrow(
                'Cannot upload attachment. Task already completed.'
            )
        })

        it('🚫 should throw ForbiddenError if user not assigned to task', async () => {
            prisma.$transaction.mockImplementation(async (cb) =>
                cb({
                    task: {
                        findUnique: jest.fn().mockResolvedValue({
                            status: 'TODO',
                            assigned_to_id: 'otherUser',
                        }),
                    },
                })
            )
            await expect(uploadFile(mockFile, 't1', 'u1')).rejects.toThrow(
                'You are not allowed to upload a file for this task.'
            )
        })
    })

    // ---------------- DELETE ATTACHMENT ----------------
    describe('deleteAttachmentService', () => {
        it('✅ should delete attachment successfully as ADMIN', async () => {
            const mockTx = {
                attachment: {
                    findUnique: jest.fn().mockResolvedValue({
                        id: 'a1',
                        file_url: 'https://blob/test.pdf',
                        task: {
                            id: 'task1',
                            status: 'IN_PROGRESS',
                            created_by_id: '1',
                            assigned_to_id: '2',
                            created_by: { name: 'Admin' },
                            assigned_to: { name: 'User' },
                        },
                    }),
                    delete: jest.fn(),
                    findMany: jest.fn().mockResolvedValue([]),
                },
                task: {
                    update: jest.fn(),
                },
            }

            prisma.$transaction.mockImplementation(async (cb) => cb(mockTx))
            del.mockResolvedValue(true)

            const result = await deleteAttachmentService('a1', '2', 'ADMIN')

            expect(del).toHaveBeenCalledWith(
                'https://blob/test.pdf',
                expect.any(Object)
            )
            expect(result.success).toBe(true)
            expect(result.message).toBe('Attachment deleted successfully.')
            expect(result.data.new_status).toBe('TODO')
        })

        it('🚫 should throw NotFoundError if attachment not found', async () => {
            prisma.$transaction.mockImplementation(async (cb) =>
                cb({
                    attachment: {
                        findUnique: jest.fn().mockResolvedValue(null),
                    },
                })
            )

            await expect(
                deleteAttachmentService('a1', '1', 'ADMIN')
            ).rejects.toThrow('Attachment not found.')
        })

        it('🚫 should throw NotFoundError if task not found', async () => {
            prisma.$transaction.mockImplementation(async (cb) =>
                cb({
                    attachment: {
                        findUnique: jest
                            .fn()
                            .mockResolvedValue({ id: 'a1', task: null }),
                    },
                })
            )
            await expect(
                deleteAttachmentService('a1', '1', 'ADMIN')
            ).rejects.toThrow('Task not found.')
        })

        it('🚫 should throw ForbiddenError if unauthorized user tries to delete', async () => {
            prisma.$transaction.mockImplementation(async (cb) =>
                cb({
                    attachment: {
                        findUnique: jest.fn().mockResolvedValue({
                            id: 'a1',
                            file_url: 'f',
                            task: {
                                id: 't1',
                                status: 'IN_PROGRESS',
                                created_by_id: 'x',
                                assigned_to_id: 'y',
                                created_by: {},
                                assigned_to: {},
                            },
                        }),
                    },
                })
            )

            await expect(
                deleteAttachmentService('a1', 'z', 'USER')
            ).rejects.toThrow('You are not allowed to delete this attachment.')
        })

        it('🚫 should throw ForbiddenError if task is DONE (non-admin)', async () => {
            prisma.$transaction.mockImplementation(async (cb) =>
                cb({
                    attachment: {
                        findUnique: jest.fn().mockResolvedValue({
                            id: 'a1',
                            file_url: 'f',
                            task: {
                                id: 't1',
                                status: 'DONE',
                                created_by_id: '1',
                                assigned_to_id: '2',
                                created_by: {},
                                assigned_to: {},
                            },
                        }),
                    },
                })
            )

            await expect(
                deleteAttachmentService('a1', '1', 'USER')
            ).rejects.toThrow('Cannot delete attachment from a completed task.')
        })
    })
})
