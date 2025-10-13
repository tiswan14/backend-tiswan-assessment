import { prisma } from '../config/prisma.js'

export async function createAttachment(attachmentData) {
    return await prisma.attachment.create({
        data: attachmentData,
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
}

export async function deleteAttachment(attachmentId) {
    return await prisma.attachment.delete({
        where: {
            id: attachmentId,
        },
    })
}

export async function getAttachmentById(id) {
    return await prisma.attachment.findUnique({
        where: { id },
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
}
