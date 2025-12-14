import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../services/api';
import './SearchUsers.css';

const SearchUsers = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (!trimmedQuery) {
      setUsers([]);
      setError('');
      setLoading(false);
      return;
    }

    const handle = setTimeout(async () => {
      try {
        setLoading(true);
        setError('');
        const res = await usersAPI.search(trimmedQuery);
        setUsers(res.data.users || []);
      } catch (e) {
        console.error('Error searching users:', e);
        setError('Failed to search users');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [trimmedQuery]);

  const toggleFollow = async (userId, isFollowing) => {
    try {
      if (isFollowing) {
        await usersAPI.unfollow(userId);
      } else {
        await usersAPI.follow(userId);
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_following: !isFollowing } : u))
      );
    } catch (e) {
      console.error('Error toggling follow from search:', e);
    }
  };

  return (
    <div className="search-users-container">
      <h2>Search Users</h2>

      <input
        className="search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by username or name..."
      />

      {loading && <div className="loading-message">Searching...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && trimmedQuery && users.length === 0 && !error && (
        <div className="empty-message">No users found</div>
      )}

      <div className="search-results">
        {users.map((u) => (
          <div key={u.id} className="search-result">
            <Link to={`/profile/${u.id}`} className="user-link">
              <div className="user-avatar">
                {u.profile_picture ? (
                  <img src={u.profile_picture} alt={u.username} />
                ) : (
                  <div className="avatar-placeholder">{u.username?.[0]?.toUpperCase()}</div>
                )}
              </div>
              <div className="user-meta">
                <div className="username">{u.username}</div>
                {u.full_name && <div className="full-name">{u.full_name}</div>}
              </div>
            </Link>

            <button
              className={u.is_following ? 'follow-btn following' : 'follow-btn'}
              onClick={() => toggleFollow(u.id, u.is_following)}
            >
              {u.is_following ? 'Unfollow' : 'Follow'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchUsers;
