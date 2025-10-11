import express from 'express'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.route.js'
import taskRoutes from './routes/task.route.js'
import { errorHandler } from './middlewares/error.handler.js'

dotenv.config()

const app = express()

app.use(express.json())

app.use('/api/auth', authRoutes)

app.use('/api', taskRoutes)

app.get('/', (req, res) => {
    res.json({
        message: '🚀 Welcome to Task Management API',
    })
})

app.use(errorHandler)

export default app
