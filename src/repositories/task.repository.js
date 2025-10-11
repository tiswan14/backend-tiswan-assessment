import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createTask(taskData) {
    return await prisma.task.create({
        data: taskData,
    })
}

export async function getAllTasks() {
    return await prisma.task.findMany()
}

export async function getTaskById(taskId) {
    return await prisma.task.findUnique({
        where: {
            id: taskId,
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
