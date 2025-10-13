// tests/controller/task.controller.test.js
import * as taskController from '../../src/controllers/task.controller.js'
import * as taskService from '../../src/services/task.service.js'

// Mock seluruh service
jest.mock('../../src/services/task.service.js')

describe('Task Controller', () => {
    let req, res, next
    const mockTask = {
        id: '1',
        title: 'Test Task',
        status: 'LOW',
        priority: 'LOW',
        due_date: new Date(Date.now() + 86400000),
    }

    beforeEach(() => {
        req = {
            body: {
                title: 'Test Task',
                status: 'TODO',
                priority: 'LOW',
                due_date: new Date(Date.now() + 86400000),
            },
            user: { userId: 1, role: 'USER' },
            params: { id: '1' },
            query: {},
        }

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        next = jest.fn()
        jest.clearAllMocks()
    })

    // ================= CREATE TASK =================
    describe('createTask', () => {
        it('should create task successfully', async () => {
            taskService.createTask.mockResolvedValue(mockTask)

            await taskController.createTask(req, res, next)

            expect(taskService.createTask).toHaveBeenCalledWith(req.body, 1)
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, data: mockTask })
            )
        })

        it('should return 400 if validation fails', async () => {
            req.body.title = 'ab' // terlalu pendek

            await taskController.createTask(req, res, next)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false })
            )
        })

        it('should call next on unexpected error', async () => {
            const error = new Error('Some error')
            taskService.createTask.mockRejectedValue(error)

            await taskController.createTask(req, res, next)

            expect(next).toHaveBeenCalledWith(error)
        })
    })

    // ================= GET ALL TASKS =================
    describe('getAllTasks', () => {
        it('should return all tasks', async () => {
            taskService.getAllTasks.mockResolvedValue([mockTask])

            await taskController.getAllTasks(req, res, next)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    count: 1,
                    data: [mockTask],
                })
            )
        })

        it('should call next on error', async () => {
            const error = new Error('DB Error')
            taskService.getAllTasks.mockRejectedValue(error)

            await taskController.getAllTasks(req, res, next)
            expect(next).toHaveBeenCalledWith(error)
        })
    })

    // ================= GET TASK BY ID =================
    describe('getTaskById', () => {
        it('should return task if found', async () => {
            taskService.getTaskById.mockResolvedValue(mockTask)

            await taskController.getTaskById(req, res, next)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, data: mockTask })
            )
        })

        it('should return 404 if task not found', async () => {
            taskService.getTaskById.mockResolvedValue(null)

            await taskController.getTaskById(req, res, next)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false })
            )
        })

        it('should call next on unexpected error', async () => {
            const error = new Error('Some error')
            taskService.getTaskById.mockRejectedValue(error)

            await taskController.getTaskById(req, res, next)
            expect(next).toHaveBeenCalledWith(error)
        })
    })

    // ================= UPDATE TASK =================
    describe('updateTask', () => {
        it('should update task successfully', async () => {
            taskService.updateTask.mockResolvedValue(mockTask)

            await taskController.updateTask(req, res, next)

            expect(taskService.updateTask).toHaveBeenCalledWith(
                '1',
                req.body,
                1,
                'USER'
            )
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, data: mockTask })
            )
        })

        it('should return 400 if validation fails', async () => {
            req.body.title = 'ab'

            await taskController.updateTask(req, res, next)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false })
            )
        })

        it('should return 404 if task not found', async () => {
            const error = new Error('Task not found')
            taskService.updateTask.mockRejectedValue(error)

            await taskController.updateTask(req, res, next)
            expect(res.status).toHaveBeenCalledWith(404)
        })

        it('should return 403 if unauthorized', async () => {
            const error = new Error('Unauthorized')
            taskService.updateTask.mockRejectedValue(error)

            await taskController.updateTask(req, res, next)
            expect(res.status).toHaveBeenCalledWith(403)
        })

        it('should call next on unexpected error', async () => {
            const error = new Error('Some error')
            taskService.updateTask.mockRejectedValue(error)

            await taskController.updateTask(req, res, next)
            expect(next).toHaveBeenCalledWith(error)
        })
    })

    // ================= DELETE TASK =================
    describe('deleteTask', () => {
        it('should delete task successfully', async () => {
            taskService.deleteTask.mockResolvedValue(mockTask)

            await taskController.deleteTask(req, res, next)

            expect(taskService.deleteTask).toHaveBeenCalledWith('1', 1, 'USER')
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, data: mockTask })
            )
        })

        it('should return 404 if task not found', async () => {
            const error = new Error('Task not found')
            taskService.deleteTask.mockRejectedValue(error)

            await taskController.deleteTask(req, res, next)
            expect(res.status).toHaveBeenCalledWith(404)
        })

        it('should return 403 if unauthorized', async () => {
            const error = new Error('Unauthorized')
            taskService.deleteTask.mockRejectedValue(error)

            await taskController.deleteTask(req, res, next)
            expect(res.status).toHaveBeenCalledWith(403)
        })

        it('should call next on unexpected error', async () => {
            const error = new Error('Some error')
            taskService.deleteTask.mockRejectedValue(error)

            await taskController.deleteTask(req, res, next)
            expect(next).toHaveBeenCalledWith(error)
        })
    })
})
