import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';
import Post from '../components/Post';
import './PostDetail.css';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getById(postId);
      setPost(response.data.post);
    } catch (err) {
      setError('Failed to load post');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="post-detail-container">
        <div className="loading-message">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-detail-container">
        <div className="error-message">{error || 'Post not found'}</div>
        <button onClick={() => navigate(-1)} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      <div className="post-detail-wrapper">
        <Post post={post} onUpdate={fetchPost} />
      </div>
    </div>
  );
};

export default PostDetail;
