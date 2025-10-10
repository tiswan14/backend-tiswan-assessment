import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.json({ message: 'Hello World from Express!' })
})

export default app
