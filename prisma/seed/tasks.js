import { PrismaClient, TaskStatus, TaskPriority } from '@prisma/client'
const prisma = new PrismaClient()

/**
 * Seed tasks
 * @param {Object} users - Object { admin, manager, user } hasil seedUsers
 */
export async function seedTasks(users) {
    console.log('Seeding Tasks...')
    try {
        const task1 = await prisma.task.create({
            data: {
                title: 'Sample Task 1',
                description: 'Task created by admin',
                status: TaskStatus.TODO,
                priority: TaskPriority.MEDIUM,
                due_date: new Date(),
                created_by_id: 'cmgl3zc7v0000pc58cq7z85xu',
            },
        })

        const task2 = await prisma.task.create({
            data: {
                title: 'Sample Task 2',
                description: 'Task assigned to manager',
                status: TaskStatus.IN_PROGRESS,
                priority: TaskPriority.HIGH,
                due_date: new Date(),
                created_by_id: 'cmgl3zcc70001pc58v4sc4y3s',
                assigned_to_id: 'cmgl3zce90002pc58jcnpuyhe',
            },
        })

        console.log('✅ Tasks seeded successfully!')
        return { task1, task2 }
    } catch (error) {
        console.error('❌ Error seeding Tasks:', error)
        throw error
    }
}
