const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const authMiddleware = require('../middleware/auth');

// GET /api/feed - Get feed
router.get('/', authMiddleware, feedController.getFeed);

module.exports = router;
