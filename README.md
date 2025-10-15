# 🔐 User Authentication System

A complete user authentication system built with Node.js, Express.js, and MySQL2.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/your-repo-name)

## Features

- User registration with email and username validation
- User login with JWT token authentication
- Password hashing using bcrypt
- Protected routes with JWT middleware
- User profile management (view and update)
- MySQL database integration
- Input validation and error handling

## Prerequisites

- Node.js (v14 or higher)
- MySQL server
- npm or yarn package manager

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your MySQL database:
   - Create a database named `login_user`
   - Update the `.env` file with your database credentials

4. Configure environment variables in `.env`:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD="your_password"
   DB_NAME=login_user
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   ```

5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Register User
- **URL:** `POST /api/auth/register`
- **Description:** Register a new user
- **Body:**
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "userId": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "token": "jwt_token_here"
    }
  }
  ```

#### 2. Login User
- **URL:** `POST /api/auth/login`
- **Description:** Login an existing user
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "userId": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "token": "jwt_token_here"
    }
  }
  ```

### Protected Endpoints (Require Authentication)

#### 3. Get User Profile
- **URL:** `GET /api/auth/profile`
- **Description:** Get current user's profile
- **Headers:**
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

#### 4. Update User Profile
- **URL:** `PUT /api/auth/profile`
- **Description:** Update current user's profile
- **Headers:**
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Body:** (All fields are optional)
  ```json
  {
    "username": "new_username",
    "email": "new_email@example.com",
    "password": "new_password123"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "id": 1,
      "username": "new_username",
      "email": "new_email@example.com",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

#### 5. Get All Users
- **URL:** `GET /api/auth/users`
- **Description:** Get all registered users (admin function)
- **Headers:**
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z"
      }
    ],
    "count": 1
  }
  ```

### Health Check

#### Health Check
- **URL:** `GET /api/health`
- **Description:** Check if the server is running
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Server is running successfully",
    "timestamp": "2023-01-01T00:00:00.000Z"
  }
  ```

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Error Status Codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (invalid/expired token)
- `404` - Not Found (user/route not found)
- `500` - Internal Server Error

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Security Features

- **Password Hashing:** Passwords are hashed using bcrypt with salt rounds of 12
- **JWT Authentication:** Secure token-based authentication with 24-hour expiration
- **Input Validation:** Email format and password length validation
- **Unique Constraints:** Username and email uniqueness enforced at database level
- **SQL Injection Protection:** Parameterized queries using MySQL2

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database configuration and connection
├── controllers/
│   └── userController.js  # User authentication controllers
├── models/
│   └── userModel.js       # User model with database operations
├── routes/
│   └── userRoutes.js      # API routes definition
├── .env                   # Environment variables
├── index.js              # Main server file
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## Dependencies

- **express:** Web framework for Node.js
- **mysql2:** MySQL client for Node.js with Promise support
- **bcrypt:** Password hashing library
- **jsonwebtoken:** JWT implementation for Node.js
- **cors:** Cross-Origin Resource Sharing middleware
- **dotenv:** Environment variable loader
- **nodemon:** Development dependency for auto-restarting server

## Development

To run in development mode with auto-restart:
```bash
npm start
```

## Testing the API

You can test the API using tools like:
- Postman
- Thunder Client (VS Code extension)
- curl commands
- Any HTTP client

### Example curl commands:

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Get Profile:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚀 Deployment

### Deploy to Vercel

1. **Fork this repository** to your GitHub account

2. **Connect to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

3. **Set Environment Variables in Vercel:**
   ```
   DB_HOST=your_mysql_host
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_database_name
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   ```

4. **Deploy:**
   - Vercel will automatically deploy your application
   - Your API will be available at `https://your-app-name.vercel.app`

### Deploy to Other Platforms

#### Railway
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

#### Render
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Environment Variables Required

Create these environment variables in your deployment platform:

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | MySQL database host | `localhost` or your cloud DB host |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `your_password` |
| `DB_NAME` | Database name | `assessment` |
| `JWT_SECRET` | Secret key for JWT | `your-super-secret-key` |
| `PORT` | Server port | `5000` |

### Database Setup for Production

For production deployment, you'll need a cloud MySQL database:

#### Option 1: PlanetScale (Recommended)
1. Create account at [PlanetScale](https://planetscale.com/)
2. Create a new database
3. Get connection details
4. Update environment variables

#### Option 2: Railway MySQL
1. Add MySQL service in Railway
2. Get connection details
3. Update environment variables

#### Option 3: AWS RDS
1. Create RDS MySQL instance
2. Configure security groups
3. Get connection details
4. Update environment variables

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js              # Database configuration
├── controllers/
│   └── userController.js  # Authentication controllers
├── models/
│   └── userModel.js       # User model
├── routes/
│   └── userRoutes.js      # API routes
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── vercel.json          # Vercel configuration
├── package.json         # Dependencies and scripts
└── index.js            # Main server file
```

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# Start development server
npm run dev
```

## 📝 API Documentation

The API will be available at your deployment URL + `/api`

Example: `https://your-app.vercel.app/api`

All endpoints are documented in the main README section above.

## License

This project is licensed under the ISC License.
