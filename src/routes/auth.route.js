import express from 'express'
import {
    register,
    login,
    refresh,
    logout,
} from '../controllers/auth.controller.js'
import rateLimiter from '../middlewares/rate.limiter.js'
import { authenticateToken } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Endpoint for user registration
router.post('/register', rateLimiter, register)

// Endpoint for user login
router.post('/login', rateLimiter, login)

// Endpoint for refresh token
router.post('/refresh-token', refresh)

// Endpoint for logout
router.post('/logout', authenticateToken, logout)

export default router
