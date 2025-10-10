import express from 'express'
import { signup } from '../controllers/auth.controller.js'
import rateLimiter from '../middlewares/rate.limiter.js'

const router = express.Router()

router.post('/register', rateLimiter, signup)

export default router
