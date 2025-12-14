const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/auth');

// POST /api/posts - Create post
router.post('/', authMiddleware, postController.createPost);

// GET /api/posts/:id - Get post by ID
router.get('/:id', authMiddleware, postController.getPostById);

// GET /api/posts/user/:userId - Get user's posts
router.get('/user/:userId', authMiddleware, postController.getUserPosts);

// DELETE /api/posts/:id - Delete post
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;
