import express from 'express';
import { acceptFriendRequest, addFriend, cancelFriendRequest, checkAuth, declineFriendRequest, getFriendRequests, login, logout, signup, updateProfile } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)

router.put('/update-profile', protectRoute, updateProfile)
router.get('/check', protectRoute, checkAuth)

router.get('/friend-requests', protectRoute, getFriendRequests)

router.post('/addfriend/:friendId', protectRoute, addFriend)
router.post('/acceptfriend/:senderId', protectRoute, acceptFriendRequest)
router.post("/declinefriend/:senderId", protectRoute, declineFriendRequest);
router.post("/cancelfriend/:friendId", protectRoute, cancelFriendRequest);

export default router