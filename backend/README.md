# Instagram Clone Backend

Backend API for Instagram-style social media application.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up PostgreSQL Database
- Install PostgreSQL if you haven't already
- Make sure your `.env` has the correct DB credentials

**Recommended (no psql required):**
```bash
npm run db:setup
```
This will:
- check PostgreSQL connectivity
- create the database (if missing)
- apply `schema.sql`

**Manual (psql):**
- Create a database named `instagram_clone`
- Run the schema.sql file to create tables:
```bash
psql -U postgres -d instagram_clone -f schema.sql
```

### 3. Configure Environment Variables
Create a `.env` file in the backend directory (copy from .env.example):
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=instagram_clone
JWT_SECRET=your_jwt_secret_key_here
```

### 4. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

Server will run on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Posts
- `POST /api/posts` - Create post (authenticated)
- `GET /api/posts/:id` - Get post by ID (authenticated)
- `GET /api/posts/user/:userId` - Get user's posts (authenticated)
- `DELETE /api/posts/:id` - Delete post (authenticated)

### Likes
- `POST /api/likes/:postId` - Like a post (authenticated)
- `DELETE /api/likes/:postId` - Unlike a post (authenticated)

### Comments
- `POST /api/comments/:postId` - Add comment (authenticated)
- `GET /api/comments/:postId` - Get comments (authenticated)
- `DELETE /api/comments/:commentId` - Delete comment (authenticated)

### Users
- `GET /api/users/:userId` - Get user profile (authenticated)
- `POST /api/users/:userId/follow` - Follow user (authenticated)
- `DELETE /api/users/:userId/follow` - Unfollow user (authenticated)
- `GET /api/users/search/query?query=username` - Search users (authenticated)

### Feed
- `GET /api/feed` - Get feed from followed users (authenticated)

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```
