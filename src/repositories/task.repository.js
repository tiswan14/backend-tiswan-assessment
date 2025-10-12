import { prisma } from '../config/prisma.js'

export async function createTask(taskData) {
    return await prisma.task.create({
        data: taskData,
    })
}

export async function getAllTasks() {
    return await prisma.task.findMany({
        include: {
            created_by: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
            assigned_to: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            attachments: true,
        },
    })
}

export async function getTaskById(taskId) {
    return await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            created_by: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
            assigned_to: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            attachments: true,
        },
    })
}

export async function updateTask(taskId, taskData) {
    return await prisma.task.update({
        where: {
            id: taskId,
        },
        data: taskData,
    })
}

export async function deleteTask(taskId) {
    return await prisma.task.delete({
        where: {
            id: taskId,
        },
    })
}
