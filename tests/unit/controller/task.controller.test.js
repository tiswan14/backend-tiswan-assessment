import {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
} from '../../../src/controllers/task.controller.js'

import * as taskService from '../../../src/services/task.service.js'
import {
    taskCreateSchema,
    taskUpdateSchema,
} from '../../../src/validators/task.validator.js'

// 🧩 Mock semua dependency
jest.mock('../../../src/services/task.service.js', () => ({
    getAllTasks: jest.fn(),
    getTaskById: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
}))

jest.mock('../../../src/validators/task.validator.js', () => ({
    taskCreateSchema: { validate: jest.fn() },
    taskUpdateSchema: { validate: jest.fn() },
}))

describe('🧠 Task Controller Unit Tests', () => {
    let req, res, next

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            user: { userId: '123', role: 'USER' },
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }
        next = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    // ---------------- CREATE TASK ----------------
    describe('createTask', () => {
        it('✅ should create task successfully', async () => {
            taskCreateSchema.validate.mockReturnValue({
                value: { title: 'New Task' },
            })
            const mockTask = { id: '1', title: 'New Task' }
            taskService.createTask.mockResolvedValue(mockTask)

            await createTask(req, res, next)

            expect(taskService.createTask).toHaveBeenCalledWith(
                { title: 'New Task' },
                '123'
            )
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Task created successfully',
                data: mockTask,
            })
        })

        it('🚫 should return 400 if validation fails', async () => {
            taskCreateSchema.validate.mockReturnValue({
                error: { details: [{ message: '"title" is required' }] },
            })

            await createTask(req, res, next)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'title is required',
            })
        })

        it('🚫 should return 404 if related entity not found', async () => {
            taskCreateSchema.validate.mockReturnValue({
                value: { title: 'Task' },
            })
            taskService.createTask.mockRejectedValue(
                new Error('Assignee not found.')
            )

            await createTask(req, res, next)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Assignee not found.',
            })
        })
    })

    // ---------------- GET ALL TASKS ----------------
    describe('getAllTasks', () => {
        it('✅ should return all tasks', async () => {
            const mockTasks = [{ id: '1' }, { id: '2' }]
            taskService.getAllTasks.mockResolvedValue(mockTasks)

            await getAllTasks(req, res, next)

            expect(taskService.getAllTasks).toHaveBeenCalledWith({
                limit: undefined,
                page: undefined,
            })
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Tasks retrieved successfully',
                count: mockTasks.length,
                data: mockTasks,
            })
        })

        it('🚫 should call next on error', async () => {
            const error = new Error('DB error')
            taskService.getAllTasks.mockRejectedValue(error)

            await getAllTasks(req, res, next)

            expect(next).toHaveBeenCalledWith(error)
        })
    })

    // ---------------- GET TASK BY ID ----------------
    describe('getTaskById', () => {
        it('✅ should return task successfully', async () => {
            req.params.id = '1'
            const mockTask = { id: '1', title: 'Task' }
            taskService.getTaskById.mockResolvedValue(mockTask)

            await getTaskById(req, res, next)

            expect(taskService.getTaskById).toHaveBeenCalledWith('1')
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Task retrieved successfully',
                data: mockTask,
            })
        })

        it('🚫 should return 404 if task not found', async () => {
            req.params.id = '1'
            taskService.getTaskById.mockResolvedValue(null)

            await getTaskById(req, res, next)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Task not found',
            })
        })

        it('🚫 should return 404 if service throws not found error', async () => {
            req.params.id = '1'
            taskService.getTaskById.mockRejectedValue(
                new Error('Task not found.')
            )

            await getTaskById(req, res, next)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Task not found.',
            })
        })
    })

    // ---------------- UPDATE TASK ----------------
    describe('updateTask', () => {
        it('✅ should update task successfully', async () => {
            req.params.id = '1'
            taskUpdateSchema.validate.mockReturnValue({
                value: { title: 'Updated Task' },
            })
            const updated = { id: '1', title: 'Updated Task' }
            taskService.updateTask.mockResolvedValue(updated)

            await updateTask(req, res, next)

            expect(taskService.updateTask).toHaveBeenCalledWith(
                '1',
                { title: 'Updated Task' },
                '123',
                'USER'
            )
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Task updated successfully',
                data: updated,
            })
        })

        it('🚫 should return 400 if validation fails', async () => {
            taskUpdateSchema.validate.mockReturnValue({
                error: { details: [{ message: '"title" is required' }] },
            })

            await updateTask(req, res, next)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'title is required',
            })
        })

        it('🚫 should return 404 if task not found', async () => {
            taskUpdateSchema.validate.mockReturnValue({
                value: { title: 'T' },
            })
            taskService.updateTask.mockRejectedValue(
                new Error('Task not found.')
            )

            await updateTask(req, res, next)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Task not found.',
            })
        })

        it('🚫 should return 403 if unauthorized', async () => {
            taskUpdateSchema.validate.mockReturnValue({
                value: { title: 'T' },
            })
            taskService.updateTask.mockRejectedValue(
                new Error('Unauthorized to update this task.')
            )

            await updateTask(req, res, next)

            expect(res.status).toHaveBeenCalledWith(403)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Unauthorized to update this task.',
            })
        })
    })

    // ---------------- DELETE TASK ----------------
    describe('deleteTask', () => {
        it('✅ should delete task successfully', async () => {
            req.params.id = '1'
            const mockDeleted = { id: '1' }
            taskService.deleteTask.mockResolvedValue(mockDeleted)

            await deleteTask(req, res, next)

            expect(taskService.deleteTask).toHaveBeenCalledWith(
                '1',
                '123',
                'USER'
            )
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Task deleted successfully',
                data: mockDeleted,
            })
        })

        it('🚫 should return 404 if not found', async () => {
            req.params.id = '1'
            taskService.deleteTask.mockRejectedValue(
                new Error('Task not found.')
            )

            await deleteTask(req, res, next)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Task not found.',
            })
        })

        it('🚫 should return 403 if unauthorized', async () => {
            req.params.id = '1'
            taskService.deleteTask.mockRejectedValue(
                new Error('Unauthorized to delete this task.')
            )

            await deleteTask(req, res, next)

            expect(res.status).toHaveBeenCalledWith(403)
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Unauthorized to delete this task.',
            })
        })
    })
})
