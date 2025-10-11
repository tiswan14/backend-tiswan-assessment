import express from 'express'
import { createTask } from '../controllers/task.controller.js'
import { authenticateToken } from '../middlewares/auth.middleware.js'
import { authorizeRoles } from '../middlewares/rbac.middleware.js'

const router = express.Router()

router.post(
    '/tasks',
    authenticateToken,
    authorizeRoles('ADMIN', 'MANAGER'),
    createTask
)

export default router
