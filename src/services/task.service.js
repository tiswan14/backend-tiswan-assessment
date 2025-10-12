// File: src/services/task.service.js

import {
    createTask as createTaskRepository,
    getAllTasks as getAllTasksRepository,
    getTaskById as getTaskByIdRepository,
    updateTask as updateTaskRepository,
    deleteTask as deleteTaskRepository,
} from '../repositories/task.repository.js'
import { findUserById } from '../repositories/user.repository.js'
import { TaskStatus, TaskPriority } from '@prisma/client'

// ✅ CREATE TASK
export async function createTask(taskData, creatorId) {
    const { title, description, status, priority, due_date, assigned_to_id } =
        taskData

    const creator = await findUserById(creatorId)
    if (!creator) {
        throw new Error('Creator not found.')
    }

    if (assigned_to_id) {
        const assignee = await findUserById(assigned_to_id)

        if (assigned_to_id === creatorId) {
            throw new Error('You cannot assign a task to yourself.')
        }
        if (!assignee) {
            throw new Error('Assignee not found.')
        }

        if (assignee.role === 'ADMIN') {
            throw new Error('You cannot assign a task to an Admin.')
        }

        if (creator.role === 'MANAGER' && assignee.role === 'ADMIN') {
            throw new Error('Manager cannot assign tasks to an Admin.')
        }
    }

    const newTaskData = {
        title,
        description,
        status: status || TaskStatus.TODO,
        priority: priority || TaskPriority.MEDIUM,
        due_date: new Date(due_date),
        created_by_id: creatorId,
        assigned_to_id: assigned_to_id,
    }

    const createdTask = await createTaskRepository(newTaskData)
    return createdTask
}

// ✅ GET ALL TASKS
export async function getAllTasks(filters) {
    try {
        if (
            filters.status &&
            !Object.values(TaskStatus).includes(filters.status)
        ) {
            throw new Error('Invalid status filter.')
        }

        if (
            filters.priority &&
            !Object.values(TaskPriority).includes(filters.priority)
        ) {
            throw new Error('Invalid priority filter.')
        }

        const tasks = await getAllTasksRepository(filters)

        return tasks
    } catch (error) {
        throw error
    }
}

// ✅ GET TASK BY ID
export async function getTaskById(taskId) {
    const task = await getTaskByIdRepository(taskId)
    if (!task) {
        throw new Error('Task not found.')
    }
    return task
}

// ✅ UPDATE TASK
export async function updateTask(taskId, taskData, userId, userRole) {
    const taskToUpdate = await getTaskByIdRepository(taskId)

    if (!taskToUpdate) {
        throw new Error('Task not found.')
    }

    // Authorization logic: Only the task creator or an ADMIN can update
    if (taskToUpdate.created_by_id !== userId && userRole !== 'ADMIN') {
        throw new Error('Unauthorized to update this task.')
    }

    return await updateTaskRepository(taskId, taskData)
}

// ✅ DELETE TASK
export async function deleteTask(taskId, userId, userRole) {
    const taskToDelete = await getTaskByIdRepository(taskId)

    if (!taskToDelete) {
        throw new Error('Task not found.')
    }

    if (userRole !== 'ADMIN' && taskToDelete.created_by_id !== userId) {
        throw new Error('Unauthorized to delete this task.')
    }

    return await deleteTaskRepository(taskId)
}
