import {
    uploadFile,
    deleteAttachmentService,
} from '../../../src/services/attachment.service.js'
import * as taskRepo from '../../../src/repositories/task.repository.js'
import * as attachmentRepo from '../../../src/repositories/attachment.repository.js'
import { put, del } from '@vercel/blob'
import {
    ForbiddenError,
    NotFoundError,
} from '../../../src/errors/constum.error.js'

// Mock semua dependensi
jest.mock('../../../src/repositories/task.repository.js')
jest.mock('../../../src/repositories/attachment.repository.js')
jest.mock('@vercel/blob', () => ({
    put: jest.fn(),
    del: jest.fn(),
}))

describe('attachmentService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    // ---------------- UPLOAD FILE ----------------
    describe('uploadFile', () => {
        const fakeFile = {
            originalname: 'test.txt',
            buffer: Buffer.from('hello'),
            mimetype: 'text/plain',
        }

        it('should throw NotFoundError if task not found', async () => {
            taskRepo.getTaskById.mockResolvedValue(null)
            await expect(uploadFile(fakeFile, 1, 1)).rejects.toThrow(
                NotFoundError
            )
        })

        it('should throw ForbiddenError if task is DONE', async () => {
            taskRepo.getTaskById.mockResolvedValue({
                status: 'DONE',
                assigned_to_id: 1,
            })
            await expect(uploadFile(fakeFile, 1, 1)).rejects.toThrow(
                ForbiddenError
            )
        })

        it('should throw ForbiddenError if user not assigned', async () => {
            taskRepo.getTaskById.mockResolvedValue({
                status: 'TODO',
                assigned_to_id: 2,
            })
            await expect(uploadFile(fakeFile, 1, 1)).rejects.toThrow(
                ForbiddenError
            )
        })

        it('should upload file and update task status', async () => {
            taskRepo.getTaskById.mockResolvedValue({
                id: 1,
                status: 'TODO',
                assigned_to_id: 1,
                created_by: { name: 'Creator' },
                assigned_to: { name: 'User' },
            })

            put.mockResolvedValue({
                url: 'https://blob.url/file.txt',
                pathname: 'file.txt',
            })
            attachmentRepo.createAttachment.mockResolvedValue({
                id: 1,
                file_name: 'file.txt',
            })
            taskRepo.updateTaskStatus.mockResolvedValue(true)

            const result = await uploadFile(fakeFile, 1, 1)

            expect(result.success).toBe(true)
            expect(result.data.new_status).toBe('IN_PROGRESS')
            expect(put).toHaveBeenCalled()
            expect(attachmentRepo.createAttachment).toHaveBeenCalled()
            expect(taskRepo.updateTaskStatus).toHaveBeenCalled()
        })
    })

    // ---------------- DELETE ATTACHMENT ----------------
    describe('deleteAttachmentService', () => {
        it('should throw NotFoundError if attachment not found', async () => {
            attachmentRepo.getAttachmentById.mockResolvedValue(null)
            await expect(deleteAttachmentService(1, 1, 'USER')).rejects.toThrow(
                NotFoundError
            )
        })

        it('should throw ForbiddenError if user not authorized', async () => {
            attachmentRepo.getAttachmentById.mockResolvedValue({ task_id: 1 })
            taskRepo.getTaskById.mockResolvedValue({
                assigned_to_id: 2,
                created_by_id: 3,
            })
            await expect(deleteAttachmentService(1, 1, 'USER')).rejects.toThrow(
                ForbiddenError
            )
        })

        it('should delete attachment successfully', async () => {
            attachmentRepo.getAttachmentById.mockResolvedValue({
                id: 1,
                task_id: 1,
                file_url: 'url',
            })
            taskRepo.getTaskById.mockResolvedValue({
                assigned_to_id: 1,
                created_by_id: 1,
            })
            del.mockResolvedValue(true)
            attachmentRepo.deleteAttachment.mockResolvedValue({ id: 1 })

            const result = await deleteAttachmentService(1, 1, 'USER')
            expect(result.success).toBe(true)
            expect(del).toHaveBeenCalledWith('url', {
                token: process.env.BLOB_READ_WRITE_TOKEN,
            })
            expect(attachmentRepo.deleteAttachment).toHaveBeenCalledWith(1)
        })
    })
})
