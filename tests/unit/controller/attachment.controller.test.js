// tests/controllers/attachment.controller.test.js
import {
    uploadTaskAttachment,
    handleDeleteAttachment,
} from '../../../src/controllers/attachment.controller.js'
import * as attachmentService from '../../../src/services/attachment.service.js'

describe('Attachment Controller', () => {
    let req, res, next

    beforeEach(() => {
        req = {
            params: {},
            user: { userId: 1, role: 'USER' },
            file: null,
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }
        next = jest.fn()
        jest.clearAllMocks()
    })

    describe('uploadTaskAttachment', () => {
        it('should return 400 if no file uploaded', async () => {
            req.params.taskId = 1
            await uploadTaskAttachment(req, res, next)
            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith({
                message: 'No file uploaded.',
            })
        })

        it('should upload file successfully', async () => {
            req.params.taskId = 1
            req.file = {
                originalname: 'test.txt',
                buffer: Buffer.from('test'),
                mimetype: 'text/plain',
            }

            const mockAttachment = { success: true, data: { id: 1 } }
            jest.spyOn(attachmentService, 'uploadFile').mockResolvedValue(
                mockAttachment
            )

            await uploadTaskAttachment(req, res, next)

            expect(attachmentService.uploadFile).toHaveBeenCalledWith(
                req.file,
                1,
                1
            )
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'File uploaded and attached to task successfully',
                data: mockAttachment,
            })
        })

        it('should return 404 if task not found', async () => {
            req.params.taskId = 1
            req.file = {
                originalname: 'test.txt',
                buffer: Buffer.from('test'),
                mimetype: 'text/plain',
            }

            jest.spyOn(attachmentService, 'uploadFile').mockRejectedValue(
                new Error('Task not found')
            )

            await uploadTaskAttachment(req, res, next)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' })
        })

        it('should call next on other errors', async () => {
            req.params.taskId = 1
            req.file = {
                originalname: 'test.txt',
                buffer: Buffer.from('test'),
                mimetype: 'text/plain',
            }

            const error = new Error('Some other error')
            jest.spyOn(attachmentService, 'uploadFile').mockRejectedValue(error)

            await uploadTaskAttachment(req, res, next)

            expect(next).toHaveBeenCalledWith(error)
        })
    })

    describe('handleDeleteAttachment', () => {
        it('should delete attachment successfully', async () => {
            req.params.id = 1
            const mockResult = { success: true, data: { id: 1 } }
            jest.spyOn(
                attachmentService,
                'deleteAttachmentService'
            ).mockResolvedValue(mockResult)

            await handleDeleteAttachment(req, res, next)

            expect(
                attachmentService.deleteAttachmentService
            ).toHaveBeenCalledWith(1, 1, 'USER')
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(mockResult)
        })

        it('should call next on error', async () => {
            req.params.id = 1
            const error = new Error('Delete failed')
            jest.spyOn(
                attachmentService,
                'deleteAttachmentService'
            ).mockRejectedValue(error)

            await handleDeleteAttachment(req, res, next)

            expect(next).toHaveBeenCalledWith(error)
        })
    })
})
