import {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
} from '../../../src/services/task.service.js'

import * as taskRepo from '../../../src/repositories/task.repository.js'
import * as userRepo from '../../../src/repositories/user.repository.js'
import {
    BadRequestError,
    NotFoundError,
    ForbiddenError,
} from '../../../src/errors/constum.error.js'
import { TaskStatus, TaskPriority } from '@prisma/client'

// 🧠 Mock repository modules
jest.mock('../../../src/repositories/task.repository.js', () => ({
    createTask: jest.fn(),
    getAllTasks: jest.fn(),
    getTaskById: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
}))
jest.mock('../../../src/repositories/user.repository.js', () => ({
    findUserById: jest.fn(),
}))

describe('🧩 taskService Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    // ---------------- CREATE TASK ----------------
    describe('createTask', () => {
        it('✅ should create task successfully when valid', async () => {
            const creator = { id: '1', role: 'ADMIN' }
            const assignee = { id: '2', role: 'USER' }
            userRepo.findUserById
                .mockResolvedValueOnce(creator)
                .mockResolvedValueOnce(assignee)
            const mockTask = { id: 'task1', title: 'Do something' }
            taskRepo.createTask.mockResolvedValue(mockTask)

            const result = await createTask(
                {
                    title: 'Do something',
                    description: 'test',
                    due_date: new Date(),
                    assigned_to_id: '2',
                },
                '1'
            )

            expect(userRepo.findUserById).toHaveBeenCalledTimes(2)
            expect(taskRepo.createTask).toHaveBeenCalled()
            expect(result).toEqual(mockTask)
        })

        it('🚫 should throw NotFoundError if creator not found', async () => {
            userRepo.findUserById.mockResolvedValueOnce(null)
            await expect(createTask({ title: 'X' }, '1')).rejects.toThrow(
                'Creator not found.'
            )
        })

        it('🚫 should throw BadRequestError if assign to self', async () => {
            const creator = { id: '1', role: 'USER' }
            userRepo.findUserById
                .mockResolvedValueOnce(creator)
                .mockResolvedValueOnce(creator)

            await expect(
                createTask({ assigned_to_id: '1' }, '1')
            ).rejects.toThrow('You cannot assign a task to yourself.')
        })

        it('🚫 should throw NotFoundError if assignee not found', async () => {
            const creator = { id: '1', role: 'USER' }
            userRepo.findUserById
                .mockResolvedValueOnce(creator)
                .mockResolvedValueOnce(null)

            await expect(
                createTask({ assigned_to_id: '2' }, '1')
            ).rejects.toThrow('Assignee not found.')
        })

        it('🚫 should throw ForbiddenError if assign to ADMIN', async () => {
            const creator = { id: '1', role: 'USER' }
            const assignee = { id: '2', role: 'ADMIN' }
            userRepo.findUserById
                .mockResolvedValueOnce(creator)
                .mockResolvedValueOnce(assignee)

            await expect(
                createTask({ assigned_to_id: '2' }, '1')
            ).rejects.toThrow('You cannot assign a task to an Admin.')
        })

        it('🚫 should throw ForbiddenError if MANAGER assigns to ADMIN', async () => {
            const creator = { id: '1', role: 'MANAGER' }
            const assignee = { id: '2', role: 'ADMIN' }
            userRepo.findUserById
                .mockResolvedValueOnce(creator)
                .mockResolvedValueOnce(assignee)

            await expect(
                createTask({ assigned_to_id: '2' }, '1')
            ).rejects.toThrow('You cannot assign a task to an Admin.')
        })
    })

    // ---------------- GET ALL TASKS ----------------
    describe('getAllTasks', () => {
        it('✅ should return all tasks', async () => {
            const mockTasks = [{ id: '1' }, { id: '2' }]
            taskRepo.getAllTasks.mockResolvedValue(mockTasks)

            const result = await getAllTasks({})
            expect(taskRepo.getAllTasks).toHaveBeenCalled()
            expect(result).toEqual(mockTasks)
        })

        it('🚫 should throw BadRequestError for invalid status', async () => {
            const filters = { status: 'INVALID' }
            await expect(getAllTasks(filters)).rejects.toThrow(
                'Invalid status filter.'
            )
        })

        it('🚫 should throw BadRequestError for invalid priority', async () => {
            const filters = { priority: 'INVALID' }
            await expect(getAllTasks(filters)).rejects.toThrow(
                'Invalid priority filter.'
            )
        })
    })

    // ---------------- GET TASK BY ID ----------------
    describe('getTaskById', () => {
        it('✅ should return task if found', async () => {
            const mockTask = { id: '1', title: 'Task' }
            taskRepo.getTaskById.mockResolvedValue(mockTask)

            const result = await getTaskById('1')
            expect(result).toEqual(mockTask)
        })

        it('🚫 should throw NotFoundError if not found', async () => {
            taskRepo.getTaskById.mockResolvedValue(null)
            await expect(getTaskById('x')).rejects.toThrow('Task not found.')
        })
    })

    // ---------------- UPDATE TASK ----------------
    describe('updateTask', () => {
        it('✅ should update task if creator or admin', async () => {
            const mockTask = { id: '1', created_by_id: '123' }
            taskRepo.getTaskById.mockResolvedValue(mockTask)
            taskRepo.updateTask.mockResolvedValue({ id: '1', updated: true })

            const result = await updateTask('1', {}, '123', 'USER')
            expect(taskRepo.updateTask).toHaveBeenCalled()
            expect(result).toEqual({ id: '1', updated: true })
        })

        it('🚫 should throw NotFoundError if task not found', async () => {
            taskRepo.getTaskById.mockResolvedValue(null)
            await expect(updateTask('x', {}, '1', 'ADMIN')).rejects.toThrow(
                'Task not found.'
            )
        })

        it('🚫 should throw ForbiddenError if unauthorized user updates', async () => {
            const mockTask = { id: '1', created_by_id: '456' }
            taskRepo.getTaskById.mockResolvedValue(mockTask)

            await expect(updateTask('1', {}, '123', 'USER')).rejects.toThrow(
                'Unauthorized to update this task.'
            )
        })
    })

    // ---------------- DELETE TASK ----------------
    describe('deleteTask', () => {
        it('✅ should delete task if admin or creator', async () => {
            const mockTask = { id: '1', created_by_id: '123' }
            taskRepo.getTaskById.mockResolvedValue(mockTask)
            taskRepo.deleteTask.mockResolvedValue(true)

            const result = await deleteTask('1', '123', 'USER')
            expect(taskRepo.deleteTask).toHaveBeenCalledWith('1')
            expect(result).toBe(true)
        })

        it('🚫 should throw NotFoundError if task not found', async () => {
            taskRepo.getTaskById.mockResolvedValue(null)
            await expect(deleteTask('x', '1', 'ADMIN')).rejects.toThrow(
                'Task not found.'
            )
        })

        it('🚫 should throw ForbiddenError if unauthorized user deletes', async () => {
            const mockTask = { id: '1', created_by_id: '999' }
            taskRepo.getTaskById.mockResolvedValue(mockTask)
            await expect(deleteTask('1', '123', 'USER')).rejects.toThrow(
                'Unauthorized to delete this task.'
            )
        })
    })
})
