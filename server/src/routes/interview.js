import express from 'express'
import { chat, getSessions, getSession } from '../controllers/interviewController.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

// authMiddleware runs before every route here
// protects all interview routes — must be logged in
router.post('/chat', authMiddleware, chat)
router.get('/sessions', authMiddleware, getSessions)
router.get('/sessions/:id', authMiddleware, getSession)

export default router