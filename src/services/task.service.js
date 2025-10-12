import {
    createTask as createTaskRepository,
    getAllTasks as getAllTasksRepository,
    getTaskById as getTaskByIdRepository,
} from '../repositories/task.repository.js'
import { findUserById } from '../repositories/user.repository.js'
import { TaskStatus, TaskPriority } from '@prisma/client'

// ✅ CREATE TASK
export async function createTask(taskData, creatorId) {
    const { title, description, status, priority, due_date, assigned_to_id } =
        taskData

    const creator = await findUserById(creatorId)
    if (!creator) {
        throw new Error('Creator not found.')
    }

    if (assigned_to_id) {
        const assignee = await findUserById(assigned_to_id)
        if (!assignee) {
            throw new Error('Assignee not found.')
        }
    }

    const newTaskData = {
        title,
        description,
        status: status || TaskStatus.TODO,
        priority: priority || TaskPriority.MEDIUM,
        due_date: new Date(due_date),
        created_by_id: creatorId,
        assigned_to_id: assigned_to_id,
    }

    const createdTask = await createTaskRepository(newTaskData)
    return createdTask
}

// ✅ GET ALL TASKS
export async function getAllTasks() {
    const tasks = await getAllTasksRepository()
    return tasks
}

// ✅ GET TASK BY ID
export async function getTaskById(taskId) {
    const task = await getTaskByIdRepository(taskId)
    if (!task) {
        throw new Error('Task not found.')
    }
    return task
}
