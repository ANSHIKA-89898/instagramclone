const pool = require('../config/db');

function parseLimit(value, fallback = 20) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, 50);
}

function parseOffset(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

// Get user profile
exports.getUserProfile = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.userId;

  try {
    // Get user info
    const userResult = await pool.query(
      `SELECT id, username, email, full_name, bio, profile_picture, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get followers count
    const followersResult = await pool.query(
      'SELECT COUNT(*) as followers_count FROM follows WHERE following_id = $1',
      [userId]
    );

    // Get following count
    const followingResult = await pool.query(
      'SELECT COUNT(*) as following_count FROM follows WHERE follower_id = $1',
      [userId]
    );

    // Get posts count
    const postsResult = await pool.query(
      'SELECT COUNT(*) as posts_count FROM posts WHERE user_id = $1',
      [userId]
    );

    // Check if current user follows this user
    const isFollowingResult = await pool.query(
      'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [currentUserId, userId]
    );

    res.json({
      user: {
        ...user,
        followers_count: parseInt(followersResult.rows[0].followers_count),
        following_count: parseInt(followingResult.rows[0].following_count),
        posts_count: parseInt(postsResult.rows[0].posts_count),
        is_following: isFollowingResult.rows.length > 0,
        is_own_profile: currentUserId == userId,
      },
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
};

// Update current user's profile picture (URL)
exports.updateProfilePicture = async (req, res) => {
  const currentUserId = req.userId;
  const { profile_picture } = req.body;

  try {
    // Allow clearing by sending empty string/null
    const normalized = profile_picture && String(profile_picture).trim() !== ''
      ? String(profile_picture).trim()
      : null;

    if (normalized && normalized.length > 255) {
      return res.status(400).json({ error: 'Profile picture URL is too long' });
    }

    const result = await pool.query(
      `UPDATE users
       SET profile_picture = $1
       WHERE id = $2
       RETURNING id, username, email, full_name, bio, profile_picture`,
      [normalized, currentUserId]
    );

    res.json({
      message: 'Profile picture updated',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ error: 'Server error updating profile picture' });
  }
};

// List followers
exports.getFollowers = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.userId;
  const limit = parseLimit(req.query.limit, 50);
  const offset = parseOffset(req.query.offset, 0);

  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.profile_picture,
              EXISTS (
                SELECT 1 FROM follows f2
                WHERE f2.follower_id = $2 AND f2.following_id = u.id
              ) AS is_following
       FROM follows f
       JOIN users u ON u.id = f.follower_id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC
       LIMIT $3 OFFSET $4`,
      [userId, currentUserId, limit, offset]
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Server error fetching followers' });
  }
};

// List following
exports.getFollowing = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.userId;
  const limit = parseLimit(req.query.limit, 50);
  const offset = parseOffset(req.query.offset, 0);

  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.profile_picture,
              EXISTS (
                SELECT 1 FROM follows f2
                WHERE f2.follower_id = $2 AND f2.following_id = u.id
              ) AS is_following
       FROM follows f
       JOIN users u ON u.id = f.following_id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC
       LIMIT $3 OFFSET $4`,
      [userId, currentUserId, limit, offset]
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Server error fetching following' });
  }
};

// Follow user
exports.followUser = async (req, res) => {
  const { userId } = req.params;
  const followerId = req.userId;

  try {
    if (followerId == userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const followCheck = await pool.query(
      'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, userId]
    );

    if (followCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Insert follow
    await pool.query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
      [followerId, userId]
    );

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Server error following user' });
  }
};

// Unfollow user
exports.unfollowUser = async (req, res) => {
  const { userId } = req.params;
  const followerId = req.userId;

  try {
    const result = await pool.query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2 RETURNING *',
      [followerId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Not following this user' });
    }

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Server error unfollowing user' });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  const { query } = req.query;
  const currentUserId = req.userId;

  try {
    if (!query || query.trim() === '') {
      return res.json({ users: [] });
    }

    const q = `%${query}%`;

    const result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.profile_picture,
              EXISTS (
                SELECT 1 FROM follows f
                WHERE f.follower_id = $2 AND f.following_id = u.id
              ) AS is_following
       FROM users u
       WHERE (u.username ILIKE $1 OR u.full_name ILIKE $1)
         AND u.id != $2
       ORDER BY u.username
       LIMIT 20`,
      [q, currentUserId]
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Server error searching users' });
  }
};
