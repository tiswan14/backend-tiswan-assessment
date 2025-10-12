import express from 'express'
import { register, login, refresh } from '../controllers/auth.controller.js'
import rateLimiter from '../middlewares/rate.limiter.js'

const router = express.Router()

// Endpoint for user registration
router.post('/register', rateLimiter, register)

//Endpoint for user login
router.post('/login', rateLimiter, login)

router.post('/refresh-token', refresh)

export default router
