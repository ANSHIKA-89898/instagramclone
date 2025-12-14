const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const authMiddleware = require('../middleware/auth');

// POST /api/likes/:postId - Like a post
router.post('/:postId', authMiddleware, likeController.likePost);

// DELETE /api/likes/:postId - Unlike a post
router.delete('/:postId', authMiddleware, likeController.unlikePost);

module.exports = router;
