const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// IMPORTANT: put non-parameter routes before "/:userId".

// GET /api/users/search/query - Search users
router.get('/search/query', authMiddleware, userController.searchUsers);

// PATCH /api/users/me/profile-picture - Update current user's profile picture (URL)
router.patch(
  '/me/profile-picture',
  authMiddleware,
  userController.updateProfilePicture
);

// GET /api/users/:userId/followers - List followers
router.get('/:userId/followers', authMiddleware, userController.getFollowers);

// GET /api/users/:userId/following - List following
router.get('/:userId/following', authMiddleware, userController.getFollowing);

// GET /api/users/:userId - Get user profile
router.get('/:userId', authMiddleware, userController.getUserProfile);

// POST /api/users/:userId/follow - Follow user
router.post('/:userId/follow', authMiddleware, userController.followUser);

// DELETE /api/users/:userId/follow - Unfollow user
router.delete('/:userId/follow', authMiddleware, userController.unfollowUser);

module.exports = router;
