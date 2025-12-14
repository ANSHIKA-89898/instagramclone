import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { likesAPI, commentsAPI } from '../services/api';
import './Post.css';

const Post = ({ post, onUpdate }) => {
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(parseInt(post.likes_count));
  const [commentsCount, setCommentsCount] = useState(parseInt(post.comments_count));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const handleLike = async () => {
    try {
      if (isLiked) {
        const response = await likesAPI.unlike(post.id);
        setLikesCount(response.data.likes_count);
        setIsLiked(false);
      } else {
        const response = await likesAPI.like(post.id);
        setLikesCount(response.data.likes_count);
        setIsLiked(true);
      }
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const loadComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const response = await commentsAPI.getComments(post.id);
        setComments(response.data.comments);
        setShowComments(true);
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setLoadingComments(false);
      }
    } else {
      setShowComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await commentsAPI.add(post.id, {
        comment_text: newComment,
      });
      setComments([response.data.comment, ...comments]);
      setCommentsCount(commentsCount + 1);
      setNewComment('');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="post">
      <div className="post-header">
        <Link to={`/profile/${post.user_id}`} className="post-user">
          <div className="post-avatar">
            {post.profile_picture ? (
              <img src={post.profile_picture} alt={post.username} />
            ) : (
              <div className="avatar-placeholder">{post.username[0].toUpperCase()}</div>
            )}
          </div>
          <span className="post-username">{post.username}</span>
        </Link>
      </div>

      <div className="post-image">
        <img src={post.image_url} alt={post.caption || 'Post'} />
      </div>

      <div className="post-actions">
        <button onClick={handleLike} className="action-btn">
          {isLiked ? '❤️' : '🤍'}
        </button>
        <button onClick={loadComments} className="action-btn">
          💬
        </button>
      </div>

      <div className="post-likes">
        <strong>{likesCount} likes</strong>
      </div>

      {post.caption && (
        <div className="post-caption">
          <Link to={`/profile/${post.user_id}`} className="caption-username">
            {post.username}
          </Link>{' '}
          {post.caption}
        </div>
      )}

      {commentsCount > 0 && (
        <button onClick={loadComments} className="view-comments-btn">
          {showComments ? 'Hide comments' : `View all ${commentsCount} comments`}
        </button>
      )}

      {showComments && (
        <div className="comments-section">
          {loadingComments ? (
            <div className="loading">Loading comments...</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment">
                <Link to={`/profile/${comment.user_id}`} className="comment-username">
                  {comment.username}
                </Link>{' '}
                {comment.comment_text}
              </div>
            ))
          )}
        </div>
      )}

      <form onSubmit={handleAddComment} className="add-comment">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="comment-input"
        />
        <button type="submit" disabled={!newComment.trim()} className="post-comment-btn">
          Post
        </button>
      </form>

      <div className="post-time">
        {new Date(post.created_at).toLocaleDateString()}
      </div>
    </div>
  );
};

export default Post;
