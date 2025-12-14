import React, { useState, useEffect } from 'react';
import { feedAPI } from '../services/api';
import Post from '../components/Post';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const response = await feedAPI.getFeed();
      setPosts(response.data.posts);
    } catch (err) {
      setError('Failed to load feed');
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-message">Loading feed...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="feed">
        {posts.length === 0 ? (
          <div className="empty-feed">
            <h2>Welcome to Instagram Clone!</h2>
            <p>Follow users to see their posts in your feed.</p>
          </div>
        ) : (
          posts.map((post) => <Post key={post.id} post={post} onUpdate={fetchFeed} />)
        )}
      </div>
    </div>
  );
};

export default Home;
