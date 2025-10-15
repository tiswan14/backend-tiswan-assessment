import { prisma } from '../../../src/config/prisma.js'
import {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskStatus,
} from '../../../src/repositories/task.repository.js'

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

describe('🧩 task.repository Unit Tests', () => {
    afterEach(() => jest.clearAllMocks())

    it('✅ should create a task successfully', async () => {
        const mockTask = { id: 1, title: 'Task A' }
        prisma.task.create.mockResolvedValue(mockTask)

        const result = await createTask({ title: 'Task A' })

        expect(prisma.task.create).toHaveBeenCalledWith({
            data: { title: 'Task A' },
            include: expect.any(Object),
        })
        expect(result).toEqual({
            success: true,
            message: 'Task created successfully',
            data: mockTask,
        })
    })

    it('✅ should get all tasks', async () => {
        const mockTasks = [{ id: 1 }, { id: 2 }]
        prisma.task.findMany.mockResolvedValue(mockTasks)

        const result = await getAllTasks({ page: 1, limit: 10 })

        expect(prisma.task.findMany).toHaveBeenCalledWith(expect.any(Object))
        expect(result).toEqual(mockTasks)
    })

    it('✅ should get task by ID', async () => {
        const mockTask = { id: 1, title: 'Test' }
        prisma.task.findUnique.mockResolvedValue(mockTask)

        const result = await getTaskById(1)

        expect(prisma.task.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            include: expect.any(Object),
        })
        expect(result).toEqual(mockTask)
    })

    it('✅ should update task successfully', async () => {
        prisma.task.update.mockResolvedValue({ id: 1, title: 'Updated' })

        const result = await updateTask(1, { title: 'Updated' })

        expect(prisma.task.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { title: 'Updated' },
        })
        expect(result).toEqual({ id: 1, title: 'Updated' })
    })

    it('✅ should delete task successfully', async () => {
        prisma.task.delete.mockResolvedValue(true)

        const result = await deleteTask(1)

        expect(prisma.task.delete).toHaveBeenCalledWith({
            where: { id: 1 },
        })
        expect(result).toBe(true)
    })

    it('✅ should update task status', async () => {
        prisma.task.update.mockResolvedValue({ id: 1, status: 'DONE' })

        const result = await updateTaskStatus(1, 'DONE')

        expect(prisma.task.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { status: 'DONE' },
        })
        expect(result).toEqual({ id: 1, status: 'DONE' })
    })
})
