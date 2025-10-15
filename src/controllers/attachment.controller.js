import {
    deleteAttachmentService,
    uploadFile,
} from '../services/attachment.service.js'

export async function uploadTaskAttachment(req, res, next) {
    try {
        const { taskId } = req.params
        const { userId } = req.user

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' })
        }

        const newAttachment = await uploadFile(req.file, taskId, userId)

        res.status(201).json({
            success: true,
            message: 'File uploaded and attached to task successfully',
            data: newAttachment,
        })
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message })
        }
        next(error)
    }
}

export async function handleDeleteAttachment(req, res, next) {
    try {
        const { id } = req.params
        const { userId, role } = req.user

        const result = await deleteAttachmentService(id, userId, role)

        res.status(200).json(result)
    } catch (err) {
        next(err)
    }
}
