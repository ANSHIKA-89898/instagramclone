import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';
import './CreatePost.css';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    image_url: '',
    caption: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await postsAPI.create(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-container">
      <div className="create-post-box">
        <h2>Create New Post</h2>
        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              name="image_url"
              placeholder="https://example.com/image.jpg"
              value={formData.image_url}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          {formData.image_url && (
            <div className="image-preview">
              <img src={formData.image_url} alt="Preview" onError={(e) => {
                e.target.style.display = 'none';
              }} />
            </div>
          )}

          <div className="form-group">
            <label>Caption</label>
            <textarea
              name="caption"
              placeholder="Write a caption..."
              value={formData.caption}
              onChange={handleChange}
              rows="4"
              className="form-textarea"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="cancel-button"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Posting...' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
