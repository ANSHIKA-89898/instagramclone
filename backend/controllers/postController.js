const pool = require('../config/db');

// Create post
exports.createPost = async (req, res) => {
  const { image_url, caption } = req.body;
  const userId = req.userId;

  try {
    if (!image_url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const result = await pool.query(
      'INSERT INTO posts (user_id, image_url, caption) VALUES ($1, $2, $3) RETURNING *',
      [userId, image_url, caption || '']
    );

    const post = result.rows[0];

    res.status(201).json({
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error creating post' });
  }
};

// Get post by ID
exports.getPostById = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const result = await pool.query(
      `SELECT p.*, u.username, u.profile_picture,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = $2) as is_liked,
        (SELECT json_agg(json_build_object('id', c.id, 'comment_text', c.comment_text, 
          'username', cu.username, 'created_at', c.created_at) 
          ORDER BY c.created_at DESC)
          FROM comments c 
          JOIN users cu ON c.user_id = cu.id 
          WHERE c.post_id = p.id) as comments
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = result.rows[0];
    post.is_liked = post.is_liked > 0;
    post.comments = post.comments || [];

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Server error fetching post' });
  }
};

// Get user's posts
exports.getUserPosts = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.userId;

  try {
    const result = await pool.query(
      `SELECT p.*, u.username, u.profile_picture,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = $2) as is_liked,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC`,
      [userId, currentUserId]
    );

    const posts = result.rows.map(post => ({
      ...post,
      is_liked: post.is_liked > 0,
    }));

    res.json({ posts });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Server error fetching posts' });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error deleting post' });
  }
};
