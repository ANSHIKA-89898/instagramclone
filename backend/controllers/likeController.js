const pool = require('../config/db');

// Like a post
exports.likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.userId;

  try {
    // Check if post exists
    const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
    
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if already liked
    const likeCheck = await pool.query(
      'SELECT id FROM likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );

    if (likeCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Post already liked' });
    }

    // Insert like
    await pool.query(
      'INSERT INTO likes (user_id, post_id) VALUES ($1, $2)',
      [userId, postId]
    );

    // Get updated likes count
    const countResult = await pool.query(
      'SELECT COUNT(*) as likes_count FROM likes WHERE post_id = $1',
      [postId]
    );

    res.json({
      message: 'Post liked successfully',
      likes_count: parseInt(countResult.rows[0].likes_count),
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Server error liking post' });
  }
};

// Unlike a post
exports.unlikePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.userId;

  try {
    const result = await pool.query(
      'DELETE FROM likes WHERE user_id = $1 AND post_id = $2 RETURNING *',
      [userId, postId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Like not found' });
    }

    // Get updated likes count
    const countResult = await pool.query(
      'SELECT COUNT(*) as likes_count FROM likes WHERE post_id = $1',
      [postId]
    );

    res.json({
      message: 'Post unliked successfully',
      likes_count: parseInt(countResult.rows[0].likes_count),
    });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ error: 'Server error unliking post' });
  }
};
