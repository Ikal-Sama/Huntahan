import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getUserContent, getUserMedia, uploadContent } from '../controllers/media.controller.js';

const router = express.Router()


router.post('/', protectRoute, uploadContent)
router.get('/', protectRoute, getUserContent)
router.get('/user/:userId', protectRoute, getUserMedia)

export default router