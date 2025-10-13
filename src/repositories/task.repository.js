import { prisma } from '../config/prisma.js'

export async function createTask(taskData) {
    return await prisma.task.create({
        data: taskData,
    })
}

export async function getAllTasks(filters) {
    const { limit, page, ...restOfFilters } = filters

    const parsedLimit = parseInt(limit) || 10
    const parsedPage = parseInt(page) || 1
    const skip = (parsedPage - 1) * parsedLimit

    const where = {}

    if (restOfFilters.status) {
        where.status = restOfFilters.status
    }
    if (restOfFilters.priority) {
        where.priority = restOfFilters.priority
    }
    if (restOfFilters.assigned_to_id) {
        where.assigned_to_id = restOfFilters.assigned_to_id
    }
    if (restOfFilters.created_by_id) {
        where.created_by_id = restOfFilters.created_by_id
    }
    if (restOfFilters.due_date_before) {
        where.due_date = {
            lt: new Date(restOfFilters.due_date_before),
        }
    }
    if (restOfFilters.due_date_after) {
        where.due_date = {
            gt: new Date(restOfFilters.due_date_after),
        }
    }

    return await prisma.task.findMany({
        where: where,
        take: parsedLimit,
        skip: skip,
        select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            due_date: true,
            created_by: {
                select: {
                    id: true,
                    name: true,
                },
            },
            assigned_to: {
                select: {
                    id: true,
                    name: true,
                },
            },
            attachments: {
                select: {
                    id: true,
                    file_name: true,
                    file_url: true,
                },
            },
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

export async function updateTaskStatus(taskId, newStatus) {
    return prisma.task.update({
        where: { id: taskId },
        data: { status: newStatus },
    })
}
