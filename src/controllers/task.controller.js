import {
    getAllTasks as getAllTasksService,
    getTaskById as getTaskByIdService,
    createTask as createTaskService,
    updateTask as updateTaskService,
    deleteTask as deleteTaskService,
} from '../services/task.service.js'

import {
    taskCreateSchema,
    taskUpdateSchema,
} from '../validators/task.validator.js'

/**
 * ✅ CREATE TASK
 * Handles task creation with validation using Joi schema.
 * Ensures the request body is valid and calls the service layer to persist the data.
 */
export async function createTask(req, res, next) {
    try {
        // Validate request body
        const { error, value } = taskCreateSchema.validate(req.body)
        if (error) {
            const message = error.details[0].message.replace(/"/g, '')
            return res.status(400).json({
                success: false,
                message,
            })
        }

        const creatorId = req.user?.userId
        const newTask = await createTaskService(value, creatorId)

        return res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: newTask,
        })
    } catch (error) {
        // Handle not found errors gracefully
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: error.message,
            })
        }
        next(error)
    }
}

/**
 * ✅ GET ALL TASKS
 * Retrieves all tasks with optional query filters (status, priority, pagination, etc.).
 */
export async function getAllTasks(req, res, next) {
    try {
        const { limit, page, ...filters } = req.query
        const tasks = await getAllTasksService({ limit, page, ...filters })

        return res.status(200).json({
            success: true,
            message: 'Tasks retrieved successfully',
            count: tasks.length,
            data: tasks,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * ✅ GET TASK BY ID
 * Fetches a specific task by its unique ID.
 */
export async function getTaskById(req, res, next) {
    try {
        const { id } = req.params
        const task = await getTaskByIdService(id)

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Task retrieved successfully',
            data: task,
        })
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: error.message,
            })
        }
        next(error)
    }
}

/**
 * ✅ UPDATE TASK
 * Updates an existing task if authorized (task creator or Admin).
 * Uses Joi validation to ensure request body correctness.
 */
export async function updateTask(req, res, next) {
    try {
        // Validate request body
        const { error, value } = taskUpdateSchema.validate(req.body)
        if (error) {
            const message = error.details[0].message.replace(/"/g, '')
            return res.status(400).json({
                success: false,
                message,
            })
        }

        const { id } = req.params
        const userId = req.user.userId
        const userRole = req.user.role

        const updatedTask = await updateTaskService(id, value, userId, userRole)

        return res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: updatedTask,
        })
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: error.message,
            })
        }
        if (error.message.includes('Unauthorized')) {
            return res.status(403).json({
                success: false,
                message: error.message,
            })
        }
        next(error)
    }
}

/**
 * ✅ DELETE TASK
 * Deletes a task if authorized (task creator or Admin).
 */
export async function deleteTask(req, res, next) {
    try {
        const { id } = req.params
        const { userId, role } = req.user

        const deletedTask = await deleteTaskService(id, userId, role)

        return res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
            data: deletedTask,
        })
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: error.message,
            })
        }
        if (error.message.includes('Unauthorized')) {
            return res.status(403).json({
                success: false,
                message: error.message,
            })
        }
        next(error)
    }
}
