const pool = require('../config/db');

// Add comment
exports.addComment = async (req, res) => {
  const { postId } = req.params;
  const { comment_text } = req.body;
  const userId = req.userId;

  try {
    if (!comment_text || comment_text.trim() === '') {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    // Check if post exists
    const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
    
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Insert comment
    const result = await pool.query(
      `INSERT INTO comments (user_id, post_id, comment_text) 
       VALUES ($1, $2, $3) 
       RETURNING id, comment_text, created_at`,
      [userId, postId, comment_text]
    );

    // Get username
    const userResult = await pool.query(
      'SELECT username FROM users WHERE id = $1',
      [userId]
    );

    const comment = {
      ...result.rows[0],
      username: userResult.rows[0].username,
    };

    res.status(201).json({
      message: 'Comment added successfully',
      comment,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error adding comment' });
  }
};

// Get comments for a post
exports.getComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.id, c.comment_text, c.created_at, u.username, u.profile_picture
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at DESC`,
      [postId]
    );

    res.json({ comments: result.rows });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error fetching comments' });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.userId;

  try {
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *',
      [commentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or unauthorized' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Server error deleting comment' });
  }
};
