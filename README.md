# User Authentication API

Node.js + Express + MySQL authentication system with JWT tokens.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/asadamin236/login-system-backend)

## Features
- User registration & login
- JWT authentication
- Password hashing (bcrypt)
- MySQL database
- Input validation

## Quick Start

```bash
# Install
npm install

# Setup environment
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=assessment
JWT_SECRET=your-secret-key

# Run
npm start
```

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/profile` | Get profile | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| GET | `/api/auth/users` | Get all users | Yes |
| GET | `/api/health` | Health check | No |

### Request Examples

**Register:**
```bash
POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com", 
  "password": "password123"
}
```

**Login:**
```bash
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Protected Routes:**
```bash
Authorization: Bearer <jwt_token>
```

## 🚀 Deployment

### Vercel
1. Import GitHub repo to Vercel
2. Set environment variables
3. Deploy

### Environment Variables
```
DB_HOST=your_mysql_host
DB_USER=your_mysql_user  
DB_PASSWORD=your_mysql_password
DB_NAME=assessment
JWT_SECRET=your-secret-key
```

## 📁 Structure
```
├── config/db.js          # Database
├── controllers/           # Logic
├── models/               # Data models
├── routes/               # API routes
└── index.js             # Server
```

## License

This project is licensed under the ISC License.
