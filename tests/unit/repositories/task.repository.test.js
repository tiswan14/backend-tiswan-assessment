// tests/repositories/task.repository.test.js
import { prisma } from '../../../src/config/prisma.js'
import {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskStatus,
} from '../../../src/repositories/task.repository.js'

// Mock Prisma
jest.mock('../../../src/config/prisma.js', () => ({
    prisma: {
        task: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}))

describe('task.repository', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    // ---------------- CREATE TASK ----------------
    describe('createTask', () => {
        it('should create task successfully', async () => {
            const fakeTask = { id: 1, title: 'Test Task' }
            prisma.task.create.mockResolvedValue(fakeTask)

            const result = await createTask({ title: 'Test Task' })
            expect(result).toEqual(fakeTask)
            expect(prisma.task.create).toHaveBeenCalledWith({
                data: { title: 'Test Task' },
            })
        })
    })

    // ---------------- GET ALL TASKS ----------------
    describe('getAllTasks', () => {
        it('should return tasks with filters and pagination', async () => {
            const fakeTasks = [{ id: 1, title: 'Task 1' }]
            prisma.task.findMany.mockResolvedValue(fakeTasks)

            const filters = { limit: 10, page: 1, status: 'TODO' }
            const result = await getAllTasks(filters)

            expect(result).toEqual(fakeTasks)
            expect(prisma.task.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: 'TODO' },
                    take: 10,
                    skip: 0,
                    select: expect.any(Object),
                })
            )
        })
    })

    // ---------------- GET TASK BY ID ----------------
    describe('getTaskById', () => {
        it('should return task if found', async () => {
            const fakeTask = { id: 1, title: 'Task 1' }
            prisma.task.findUnique.mockResolvedValue(fakeTask)

            const result = await getTaskById(1)
            expect(result).toEqual(fakeTask)
            expect(prisma.task.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: expect.any(Object),
            })
        })
    })

    // ---------------- UPDATE TASK ----------------
    describe('updateTask', () => {
        it('should update task successfully', async () => {
            const updatedTask = { id: 1, title: 'Updated Task' }
            prisma.task.update.mockResolvedValue(updatedTask)

            const result = await updateTask(1, { title: 'Updated Task' })
            expect(result).toEqual(updatedTask)
            expect(prisma.task.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { title: 'Updated Task' },
            })
        })
    })

    // ---------------- DELETE TASK ----------------
    describe('deleteTask', () => {
        it('should delete task successfully', async () => {
            const deletedTask = { id: 1 }
            prisma.task.delete.mockResolvedValue(deletedTask)

            const result = await deleteTask(1)
            expect(result).toEqual(deletedTask)
            expect(prisma.task.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            })
        })
    })

    // ---------------- UPDATE TASK STATUS ----------------
    describe('updateTaskStatus', () => {
        it('should update task status successfully', async () => {
            const updatedTask = { id: 1, status: 'DONE' }
            prisma.task.update.mockResolvedValue(updatedTask)

            const result = await updateTaskStatus(1, 'DONE')
            expect(result).toEqual(updatedTask)
            expect(prisma.task.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { status: 'DONE' },
            })
        })
    })
})
