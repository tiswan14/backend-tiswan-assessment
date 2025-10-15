// tests/unit/services/task.service.test.js
import {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
} from '../../../src/services/task.service.js'

import * as taskRepo from '../../../src/repositories/task.repository.js'
import * as userRepo from '../../../src/repositories/user.repository.js'
import { TaskStatus, TaskPriority } from '@prisma/client'
import {
    NotFoundError,
    BadRequestError,
    ForbiddenError,
} from '../../../src/errors/constum.error.js' // path sudah benar

// Mock semua repository
jest.mock('../../../src/repositories/task.repository.js')
jest.mock('../../../src/repositories/user.repository.js')

describe('taskService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    // ---------------- CREATE TASK ----------------
    describe('createTask', () => {
        it('should throw NotFoundError if creator not found', async () => {
            userRepo.findUserById.mockResolvedValue(null)

            await expect(createTask({ title: 'Test' }, 1)).rejects.toThrow(
                NotFoundError
            )
        })

        it('should throw BadRequestError if assigning task to self', async () => {
            userRepo.findUserById.mockResolvedValue({ id: 1, role: 'USER' })

            await expect(
                createTask({ title: 'Test', assigned_to_id: 1 }, 1)
            ).rejects.toThrow(BadRequestError)
        })

        it('should create a task successfully', async () => {
            userRepo.findUserById.mockImplementation((id) =>
                Promise.resolve({ id, role: 'USER' })
            )
            taskRepo.createTask.mockResolvedValue({ id: 1, title: 'Test' })

            const result = await createTask({ title: 'Test' }, 1)
            expect(result).toEqual({ id: 1, title: 'Test' })
            expect(taskRepo.createTask).toHaveBeenCalledTimes(1)
        })
    })

    // ---------------- GET ALL TASKS ----------------
    describe('getAllTasks', () => {
        it('should throw BadRequestError for invalid status filter', async () => {
            await expect(getAllTasks({ status: 'INVALID' })).rejects.toThrow(
                BadRequestError
            )
        })

        it('should call repository and return tasks', async () => {
            const fakeTasks = [{ id: 1, title: 'Task 1' }]
            taskRepo.getAllTasks.mockResolvedValue(fakeTasks)

            const result = await getAllTasks({})
            expect(result).toEqual(fakeTasks)
            expect(taskRepo.getAllTasks).toHaveBeenCalled()
        })
    })

    // ---------------- GET TASK BY ID ----------------
    describe('getTaskById', () => {
        it('should throw NotFoundError if task not found', async () => {
            taskRepo.getTaskById.mockResolvedValue(null)
            await expect(getTaskById(1)).rejects.toThrow(NotFoundError)
        })

        it('should return task if found', async () => {
            const task = { id: 1, title: 'Task 1' }
            taskRepo.getTaskById.mockResolvedValue(task)
            const result = await getTaskById(1)
            expect(result).toEqual(task)
        })
    })

    // ---------------- UPDATE TASK ----------------
    describe('updateTask', () => {
        it('should throw NotFoundError if task not found', async () => {
            taskRepo.getTaskById.mockResolvedValue(null)
            await expect(updateTask(1, {}, 1, 'USER')).rejects.toThrow(
                NotFoundError
            )
        })

        it('should throw ForbiddenError if user not authorized', async () => {
            taskRepo.getTaskById.mockResolvedValue({ created_by_id: 2 })
            await expect(updateTask(1, {}, 1, 'USER')).rejects.toThrow(
                ForbiddenError
            )
        })

        it('should update task if authorized', async () => {
            taskRepo.getTaskById.mockResolvedValue({ created_by_id: 1 })
            taskRepo.updateTask.mockResolvedValue({ id: 1, title: 'Updated' })

            const result = await updateTask(1, { title: 'Updated' }, 1, 'USER')
            expect(result).toEqual({ id: 1, title: 'Updated' })
            expect(taskRepo.updateTask).toHaveBeenCalledWith(1, {
                title: 'Updated',
            })
        })
    })

    // ---------------- DELETE TASK ----------------
    describe('deleteTask', () => {
        it('should throw NotFoundError if task not found', async () => {
            taskRepo.getTaskById.mockResolvedValue(null)
            await expect(deleteTask(1, 1, 'USER')).rejects.toThrow(
                NotFoundError
            )
        })

        it('should throw ForbiddenError if user not authorized', async () => {
            taskRepo.getTaskById.mockResolvedValue({ created_by_id: 2 })
            await expect(deleteTask(1, 1, 'USER')).rejects.toThrow(
                ForbiddenError
            )
        })

        it('should delete task if authorized', async () => {
            taskRepo.getTaskById.mockResolvedValue({ created_by_id: 1 })
            taskRepo.deleteTask.mockResolvedValue({ id: 1 })

            const result = await deleteTask(1, 1, 'USER')
            expect(result).toEqual({ id: 1 })
            expect(taskRepo.deleteTask).toHaveBeenCalledWith(1)
        })
    })
})
