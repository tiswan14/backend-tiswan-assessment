// routes/task.routes.js
import express from 'express'
import {
    createTask,
    getAllTasks,
    getTaskById,
} from '../controllers/task.controller.js'
import { authenticateToken } from '../middlewares/auth.middleware.js'
import { authorizeRoles } from '../middlewares/rbac.middleware.js'

const router = express.Router()

router.post(
    '/tasks',
    authenticateToken,
    authorizeRoles('ADMIN', 'MANAGER'),
    createTask
)

router.get('/tasks', authenticateToken, getAllTasks)

router.get('/tasks/:id', authenticateToken, getTaskById)

export default router
