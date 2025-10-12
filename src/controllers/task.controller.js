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

// ✅ CREATE TASK
export async function createTask(req, res, next) {
    try {
        const { error, value } = taskCreateSchema.validate(req.body)

        if (error) {
            const errorMessage = error.details[0].message.replace(/"/g, '')
            return res
                .status(400)
                .json({ success: false, message: errorMessage })
        }

        const creatorId = req.user?.userId

        const newTask = await createTaskService(value, creatorId)

        return res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: newTask,
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

// ✅ GET ALL TASKS
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

// ✅ GET TASK BY ID
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

// ✅ UPDATE TASK
export async function updateTask(req, res, next) {
    try {
        const { error, value } = taskUpdateSchema.validate(req.body)

        if (error) {
            const errorMessage = error.details[0].message.replace(/"/g, '')
            return res
                .status(400)
                .json({ success: false, message: errorMessage })
        }

        const { id } = req.params
        const userId = req.user.userId
        const userRole = req.user.role

        const updatedTask = await updateTaskService(id, value, userId, userRole)

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: updatedTask,
        })
    } catch (error) {
        if (error.message.includes('not found')) {
            return res
                .status(404)
                .json({ success: false, message: error.message })
        }
        if (error.message.includes('Unauthorized')) {
            return res
                .status(403)
                .json({ success: false, message: error.message })
        }
        next(error)
    }
}

// ✅ DELETE TASK
export async function deleteTask(req, res, next) {
    try {
        const { id } = req.params
        const deletedTask = await deleteTaskService(
            id,
            req.user.userId,
            req.user.role
        )

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
            data: deletedTask,
        })
    } catch (error) {
        if (error.message.includes('not found')) {
            return res
                .status(404)
                .json({ success: false, message: error.message })
        }
        if (error.message.includes('Unauthorized')) {
            return res
                .status(403)
                .json({ success: false, message: error.message })
        }
        next(error)
    }
}
