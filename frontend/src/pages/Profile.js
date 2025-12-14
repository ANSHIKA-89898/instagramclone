import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI, postsAPI } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingPhoto, setEditingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [savingPhoto, setSavingPhoto] = useState(false);

  const [showListModal, setShowListModal] = useState(false);
  const [listType, setListType] = useState('followers');
  const [listUsers, setListUsers] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const [profileResponse, postsResponse] = await Promise.all([
        usersAPI.getProfile(userId),
        postsAPI.getUserPosts(userId),
      ]);
      setProfile(profileResponse.data.user);
      setPhotoUrl(profileResponse.data.user.profile_picture || '');
      setPosts(postsResponse.data.posts);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFollow = async () => {
    try {
      if (profile.is_following) {
        await usersAPI.unfollow(userId);
      } else {
        await usersAPI.follow(userId);
      }
      fetchProfile();
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const openList = async (type) => {
    try {
      setListType(type);
      setShowListModal(true);
      setLoadingList(true);
      setListError('');

      const res =
        type === 'followers'
          ? await usersAPI.getFollowers(userId)
          : await usersAPI.getFollowing(userId);

      setListUsers(res.data.users || []);
    } catch (e) {
      console.error('Error fetching follower/following list:', e);
      setListError('Failed to load list');
      setListUsers([]);
    } finally {
      setLoadingList(false);
    }
  };

  const closeList = () => {
    setShowListModal(false);
    setListUsers([]);
    setListError('');
    setLoadingList(false);
  };

  const toggleFollowInList = async (targetUserId, isFollowing) => {
    try {
      if (isFollowing) {
        await usersAPI.unfollow(targetUserId);
      } else {
        await usersAPI.follow(targetUserId);
      }

      setListUsers((prev) =>
        prev.map((u) =>
          u.id === targetUserId ? { ...u, is_following: !isFollowing } : u
        )
      );

      // Counts may change depending on list type; simplest is re-fetch profile.
      fetchProfile();
    } catch (e) {
      console.error('Error toggling follow from list:', e);
    }
  };

  const saveProfilePhoto = async () => {
    try {
      setSavingPhoto(true);
      const res = await usersAPI.updateProfilePicture(photoUrl);

      if (currentUser?.id === res.data.user?.id) {
        updateUser({ ...currentUser, ...res.data.user });
      }

      setEditingPhoto(false);
      fetchProfile();
    } catch (e) {
      console.error('Error updating profile picture:', e);
    } finally {
      setSavingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-message">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-container">
        <div className="error-message">{error || 'Profile not found'}</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-large">
          {profile.profile_picture ? (
            <img src={profile.profile_picture} alt={profile.username} />
          ) : (
            <div className="avatar-placeholder-large">
              {profile.username[0].toUpperCase()}
            </div>
          )}
        </div>

        <div className="profile-info">
          <div className="profile-username-row">
            <h2>{profile.username}</h2>
            {!profile.is_own_profile ? (
              <button onClick={handleFollow} className="follow-button">
                {profile.is_following ? 'Unfollow' : 'Follow'}
              </button>
            ) : (
              <button
                onClick={() => setEditingPhoto((v) => !v)}
                className="follow-button secondary"
              >
                Edit photo
              </button>
            )}
          </div>

          {profile.is_own_profile && editingPhoto && (
            <div className="edit-photo">
              <div className="edit-photo-row">
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Profile picture URL (leave empty to remove)"
                  className="edit-photo-input"
                />
                <button
                  onClick={saveProfilePhoto}
                  disabled={savingPhoto}
                  className="follow-button"
                >
                  {savingPhoto ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditingPhoto(false);
                    setPhotoUrl(profile.profile_picture || '');
                  }}
                  className="follow-button secondary"
                >
                  Cancel
                </button>
              </div>
              <div className="edit-photo-hint">
                Tip: use a direct image URL (ends with .jpg/.png) for best results.
              </div>
            </div>
          )}

          <div className="profile-stats">
            <div className="stat">
              <strong>{profile.posts_count}</strong> posts
            </div>
            <button
              type="button"
              className="stat stat-button"
              onClick={() => openList('followers')}
            >
              <strong>{profile.followers_count}</strong> followers
            </button>
            <button
              type="button"
              className="stat stat-button"
              onClick={() => openList('following')}
            >
              <strong>{profile.following_count}</strong> following
            </button>
          </div>

          {profile.full_name && (
            <div className="profile-fullname">{profile.full_name}</div>
          )}
          {profile.bio && <div className="profile-bio">{profile.bio}</div>}
        </div>
      </div>

      <div className="profile-posts">
        <div className="posts-grid">
          {posts.length === 0 ? (
            <div className="no-posts">No posts yet</div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="grid-post">
                <img src={post.image_url} alt={post.caption || 'Post'} />
                <div className="grid-post-overlay">
                  <span>❤️ {post.likes_count}</span>
                  <span>💬 {post.comments_count}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showListModal && (
        <div className="modal-overlay" onClick={closeList}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{listType === 'followers' ? 'Followers' : 'Following'}</h3>
              <button className="modal-close" onClick={closeList}>
                ✕
              </button>
            </div>

            {loadingList && <div className="modal-loading">Loading...</div>}
            {listError && <div className="modal-error">{listError}</div>}

            {!loadingList && !listError && listUsers.length === 0 && (
              <div className="modal-empty">No users</div>
            )}

            <div className="modal-list">
              {listUsers.map((u) => (
                <div key={u.id} className="modal-user">
                  <Link to={`/profile/${u.id}`} className="modal-user-link" onClick={closeList}>
                    <div className="modal-avatar">
                      {u.profile_picture ? (
                        <img src={u.profile_picture} alt={u.username} />
                      ) : (
                        <div className="modal-avatar-placeholder">
                          {u.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="modal-user-meta">
                      <div className="modal-username">{u.username}</div>
                      {u.full_name && <div className="modal-fullname">{u.full_name}</div>}
                    </div>
                  </Link>

                  {currentUser?.id !== u.id && (
                    <button
                      className={u.is_following ? 'follow-button secondary' : 'follow-button'}
                      onClick={() => toggleFollowInList(u.id, u.is_following)}
                    >
                      {u.is_following ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
