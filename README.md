# Instagram Clone - Fullstack Application

A full-featured Instagram-style social media application built with React.js, Node.js, Express, and PostgreSQL.

## Features

### Backend Features
- ✅ User Authentication (Signup/Login with JWT)
- ✅ Password Hashing with bcryptjs
- ✅ Post Creation with image URLs and captions
- ✅ Like/Unlike posts
- ✅ Comment on posts
- ✅ Follow/Unfollow users
- ✅ Feed showing posts from followed users
- ✅ User profiles with stats
- ✅ Secure authenticated routes

### Frontend Features
- ✅ Login & Signup pages
- ✅ Home Feed displaying posts
- ✅ Create Post page
- ✅ Profile pages with follow/unfollow
- ✅ Post Detail view
- ✅ Interactive like/comment UI
- ✅ Secure token storage
- ✅ Responsive design
- ✅ Real-time UI updates

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs
- CORS
- dotenv

### Frontend
- React.js
- React Router DOM
- Axios
- Context API for state management

## Project Structure

```
instagram-clone/
├── backend/
│   ├── config/
│   │   └── db.js                 # PostgreSQL connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── postController.js     # Post operations
│   │   ├── likeController.js     # Like operations
│   │   ├── commentController.js  # Comment operations
│   │   ├── userController.js     # User & follow operations
│   │   └── feedController.js     # Feed logic
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   ├── posts.js              # Post routes
│   │   ├── likes.js              # Like routes
│   │   ├── comments.js           # Comment routes
│   │   ├── users.js              # User routes
│   │   └── feed.js               # Feed routes
│   ├── schema.sql                # Database schema
│   ├── server.js                 # Main server file
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js         # Navigation bar
    │   │   ├── Post.js           # Post component
    │   │   └── *.css
    │   ├── context/
    │   │   └── AuthContext.js    # Authentication context
    │   ├── pages/
    │   │   ├── Login.js          # Login page
    │   │   ├── Signup.js         # Signup page
    │   │   ├── Home.js           # Home feed
    │   │   ├── CreatePost.js     # Create post page
    │   │   ├── Profile.js        # Profile page
    │   │   ├── PostDetail.js     # Post detail page
    │   │   └── *.css
    │   ├── services/
    │   │   └── api.js            # API service layer
    │   ├── App.js                # Main app component
    │   └── index.js
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up PostgreSQL database:

**Recommended (no psql required):**
```bash
cd backend
npm run db:setup
```

**Manual (psql):**
```bash
# Create database
psql -U postgres
CREATE DATABASE instagram_clone;
\q

# Run schema
psql -U postgres -d instagram_clone -f schema.sql
```

4. Create a `.env` file in the backend directory:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=instagram_clone
JWT_SECRET=your_super_secret_jwt_key_here
```

5. Start the backend server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

Frontend will run on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Posts
- `POST /api/posts` - Create a new post
- `GET /api/posts/:id` - Get post by ID
- `GET /api/posts/user/:userId` - Get user's posts
- `DELETE /api/posts/:id` - Delete post

### Likes
- `POST /api/likes/:postId` - Like a post
- `DELETE /api/likes/:postId` - Unlike a post

### Comments
- `POST /api/comments/:postId` - Add comment to post
- `GET /api/comments/:postId` - Get comments for post
- `DELETE /api/comments/:commentId` - Delete comment

### Users
- `GET /api/users/:userId` - Get user profile
- `POST /api/users/:userId/follow` - Follow user
- `DELETE /api/users/:userId/follow` - Unfollow user
- `GET /api/users/search/query?query=username` - Search users

### Feed
- `GET /api/feed` - Get feed from followed users

## Usage

1. **Sign Up**: Create a new account with username, email, and password
2. **Login**: Login with your credentials
3. **Create Posts**: Add posts with image URLs and captions
4. **Follow Users**: Visit profiles and follow other users
5. **View Feed**: See posts from users you follow
6. **Interact**: Like and comment on posts
7. **Profile**: View your profile with all your posts and stats

## Database Schema

### Users
- id, username, email, password_hash, full_name, bio, profile_picture, created_at

### Posts
- id, user_id, image_url, caption, created_at

### Likes
- id, user_id, post_id, created_at

### Comments
- id, user_id, post_id, comment_text, created_at

### Follows
- id, follower_id, following_id, created_at

## Security Features

- Passwords hashed with bcryptjs (salt rounds: 10)
- JWT tokens for authentication (7-day expiration)
- Protected routes requiring authentication
- Token stored securely in localStorage
- SQL injection prevention with parameterized queries

## Future Enhancements

- Direct messaging
- Stories feature
- Image upload (currently uses URLs)
- Real-time notifications
- Infinite scroll for feed
- Search functionality
- Edit profile
- Dark mode

## License

MIT

## Author

Built as a fullstack Instagram clone demonstration project.
