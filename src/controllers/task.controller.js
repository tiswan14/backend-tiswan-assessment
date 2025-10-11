import { createTask as createTaskService } from '../services/task.service.js'
import { taskCreateSchema } from '../validators/task.validator.js'

export async function createTask(req, res, next) {
    try {
        const { error, value } = taskCreateSchema.validate(req.body)

        if (error) {
            const errorMessage = error.details[0].message.replace(/"/g, '')
            return res
                .status(400)
                .json({ success: false, message: errorMessage })
        }

        const creatorId = req.user.userId

        const newTask = await createTaskService(value, creatorId)

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: newTask,
        })
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message })
        }
        next(error)
    }
}
