const pool = require('../config/db');

// Get feed
exports.getFeed = async (req, res) => {
  const userId = req.userId;
  const { limit = 20, offset = 0 } = req.query;

  try {
    // Get posts from users that the current user follows
    const result = await pool.query(
      `SELECT p.*, u.username, u.profile_picture,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = $1) as is_liked,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id IN (
        SELECT following_id FROM follows WHERE follower_id = $1
      ) OR p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const posts = result.rows.map(post => ({
      ...post,
      is_liked: post.is_liked > 0,
    }));

    res.json({ posts });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Server error fetching feed' });
  }
};
