import express from 'express'
import { protectRoute } from '../middleware/auth.middleware.js';
import { getFriendsForMessages, getMessages, getUsersForSidebar, sendMessage } from '../controllers/message.controller.js';

const router = express.Router()

router.get('/users', protectRoute, getUsersForSidebar)
router.get("/users/friends", protectRoute, getFriendsForMessages);
router.get("/:id", protectRoute, getMessages)
router.post('/send/:id', protectRoute, sendMessage)

export default router;