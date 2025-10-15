import express from 'express'
import { handleDeleteAttachment } from '../controllers/attachment.controller.js'
import { authenticateToken } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.delete('/attachments/:id', authenticateToken, handleDeleteAttachment)

export default router
