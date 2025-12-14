const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/auth');

// POST /api/comments/:postId - Add comment
router.post('/:postId', authMiddleware, commentController.addComment);

// GET /api/comments/:postId - Get comments for a post
router.get('/:postId', authMiddleware, commentController.getComments);

// DELETE /api/comments/:commentId - Delete comment
router.delete('/:commentId', authMiddleware, commentController.deleteComment);

module.exports = router;
