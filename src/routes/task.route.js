// routes/task.routes.js
import express from 'express'
import {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
} from '../controllers/task.controller.js'
import { uploadTaskAttachment } from '../controllers/attachment.controller.js'
import { authenticateToken } from '../middlewares/auth.middleware.js'
import { authorizeRoles } from '../middlewares/rbac.middleware.js'
import { upload } from '../middlewares/upload.middleware.js'

const router = express.Router()

router.post(
    '/tasks',
    authenticateToken,
    authorizeRoles('ADMIN', 'MANAGER'),
    createTask
)

router.get('/tasks', authenticateToken, getAllTasks)

router.get('/tasks/:id', authenticateToken, getTaskById)

router.patch(
    '/tasks/:id',
    authenticateToken,
    authorizeRoles('ADMIN', 'MANAGER'),
    updateTask
)

router.delete(
    '/tasks/:id',
    authenticateToken,
    authorizeRoles('ADMIN', 'MANAGER'),
    deleteTask
)

router.post(
    '/tasks/:taskId/attachments',
    authenticateToken,
    upload.single('file'),
    uploadTaskAttachment
)

export default router
