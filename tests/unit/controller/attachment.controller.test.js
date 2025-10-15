import {
    uploadTaskAttachment,
    handleDeleteAttachment,
} from '../../../src/controllers/attachment.controller.js'

import {
    deleteAttachmentService,
    uploadFile,
} from '../../../src/services/attachment.service.js'

// 🧩 Mock semua dependency service
jest.mock('../../../src/services/attachment.service.js', () => ({
    uploadFile: jest.fn(),
    deleteAttachmentService: jest.fn(),
}))

describe('📎 Attachment Controller Unit Tests', () => {
    let req, res, next

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            user: { userId: '123', role: 'USER' },
            file: null,
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }
        next = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    // ---------------- UPLOAD ATTACHMENT ----------------
    describe('uploadTaskAttachment', () => {
        it('✅ should upload file successfully', async () => {
            req.params.taskId = 'task1'
            req.file = { originalname: 'test.pdf', buffer: Buffer.from('mock') }

            const mockResult = {
                success: true,
                message: 'Attachment uploaded successfully.',
                data: { attachment: { id: 'a1' } },
            }
            uploadFile.mockResolvedValue(mockResult)

            await uploadTaskAttachment(req, res, next)

            expect(uploadFile).toHaveBeenCalledWith(req.file, 'task1', '123')
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'File uploaded and attached to task successfully',
                data: mockResult,
            })
        })

        it('🚫 should return 400 if no file uploaded', async () => {
            req.params.taskId = 'task1'
            req.file = null

            await uploadTaskAttachment(req, res, next)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith({
                message: 'No file uploaded.',
            })
        })

        it('🚫 should return 404 if task not found', async () => {
            req.params.taskId = 'task1'
            req.file = { originalname: 'test.pdf', buffer: Buffer.from('mock') }

            uploadFile.mockRejectedValue(new Error('Task not found.'))

            await uploadTaskAttachment(req, res, next)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({
                message: 'Task not found.',
            })
        })

        it('🚫 should call next on unexpected error', async () => {
            const error = new Error('Unexpected server error')
            uploadFile.mockRejectedValue(error)
            req.file = { originalname: 'file.txt' }
            req.params.taskId = 't1'

            await uploadTaskAttachment(req, res, next)
            expect(next).toHaveBeenCalledWith(error)
        })
    })

    // ---------------- DELETE ATTACHMENT ----------------
    describe('handleDeleteAttachment', () => {
        it('✅ should delete attachment successfully', async () => {
            req.params.id = 'a1'
            const mockResult = {
                success: true,
                message: 'Attachment deleted successfully.',
                data: { deleted_attachment_id: 'a1' },
            }
            deleteAttachmentService.mockResolvedValue(mockResult)

            await handleDeleteAttachment(req, res, next)

            expect(deleteAttachmentService).toHaveBeenCalledWith(
                'a1',
                '123',
                'USER'
            )
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(mockResult)
        })

        it('🚫 should call next on error', async () => {
            const error = new Error('Deletion failed')
            deleteAttachmentService.mockRejectedValue(error)
            req.params.id = 'a1'

            await handleDeleteAttachment(req, res, next)
            expect(next).toHaveBeenCalledWith(error)
        })
    })
})
