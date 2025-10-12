import {
    getAllTasks as getAllTasksService,
    getTaskById as getTaskByIdService,
    createTask as createTaskService,
} from '../services/task.service.js'
import { taskCreateSchema } from '../validators/task.validator.js'

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

        const creatorId = req.user?.userId // aman kalau req.user undefined

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
        const tasks = await getAllTasksService()
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
