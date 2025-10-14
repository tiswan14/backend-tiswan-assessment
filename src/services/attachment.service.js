import { put, del } from '@vercel/blob'
import slugify from 'slugify'

import { ForbiddenError, NotFoundError } from '../errors/constum.error.js'
import {
    getTaskById,
    updateTaskStatus,
} from '../repositories/task.repository.js'
import {
    deleteAttachment,
    getAttachmentById,
} from '../repositories/attachment.repository.js'

import { prisma } from '../config/prisma.js'

export async function uploadFile(file, taskId, userId) {
    return await prisma.$transaction(async (tx) => {
        const task = await tx.task.findUnique({
            where: { id: taskId },
            include: {
                created_by: true,
                assigned_to: true,
            },
        })

        if (!task) throw new NotFoundError('Task not found.')

        if (task.status === 'DONE') {
            throw new ForbiddenError(
                'Cannot upload attachment. Task already completed.'
            )
        }

        if (task.assigned_to_id !== userId) {
            throw new ForbiddenError(
                'You are not allowed to upload a file for this task.'
            )
        }

        const creatorName = task.created_by?.name || 'unknown_creator'
        const assigneeName = task.assigned_to?.name || 'unknown_user'
        const safeCreator = slugify(creatorName, { lower: true, strict: true })
        const safeAssignee = slugify(assigneeName, {
            lower: true,
            strict: true,
        })
        const timestamp = Date.now()
        const filePath = `tasks/${safeCreator}/${safeAssignee}/${timestamp}-${file.originalname}`

        const blob = await put(filePath, file.buffer, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
        })

        const newAttachment = await tx.attachment.create({
            data: {
                file_url: blob.url,
                file_name: blob.pathname,
                mime_type: file.mimetype,
                task_id: taskId,
            },
        })

        let newStatus = task.status
        if (task.status === 'TODO') newStatus = 'IN_PROGRESS'
        else if (task.status === 'IN_PROGRESS') newStatus = 'DONE'

        if (newStatus !== task.status) {
            await tx.task.update({
                where: { id: taskId },
                data: { status: newStatus },
            })
        }

        return {
            success: true,
            message: 'Attachment uploaded successfully.',
            data: {
                attachment: newAttachment,
                new_status: newStatus,
            },
        }
    })
}

export async function deleteAttachmentService(attachmentId, userId, userRole) {
    const attachment = await getAttachmentById(attachmentId)
    if (!attachment) throw new NotFoundError('Attachment not found.')

    const task = await getTaskById(attachment.task_id)
    if (!task) throw new NotFoundError('Task not found.')

    if (
        task.assigned_to_id !== userId &&
        task.created_by_id !== userId &&
        userRole !== 'ADMIN'
    ) {
        throw new ForbiddenError(
            'You are not allowed to delete this attachment.'
        )
    }

    await del(attachment.file_url, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    const deleted = await deleteAttachment(attachmentId)

    return {
        success: true,
        message: 'Attachment deleted successfully.',
        data: deleted,
    }
}
