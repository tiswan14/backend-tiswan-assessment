import express from 'express'
import {
    getAllUsersController,
    getUserByIdController,
    deleteUserController,
} from '../controllers/user.controller.js'
import { authenticateToken } from '../middlewares/auth.middleware.js'
import { authorizeRoles } from '../middlewares/rbac.middleware.js'

const router = express.Router()

router.get(
    '/users',
    authenticateToken,
    authorizeRoles('ADMIN'),
    getAllUsersController
)
router.get(
    '/users/:id',
    authenticateToken,
    authorizeRoles('ADMIN', 'MANAGER'),
    getUserByIdController
)
router.delete(
    '/users/:id',
    authenticateToken,
    authorizeRoles('ADMIN'),
    deleteUserController
)

export default router
