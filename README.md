# 📱 Social Media API (Backend)

Social Media API is a backend project built using **Node.js** and **Express.js** that provides RESTful APIs for a social media application. It handles user authentication, posts, comments, and other core social media functionalities in a clean and scalable architecture. This backend can be connected to any frontend framework such as React, Flutter, or mobile applications.

## ✨ Features
- User registration and login
- Authentication and authorization using JWT
- Create, read, update, and delete posts
- Create and manage comments
- Protected routes
- Clean and organized project structure

## 🛠️ Built With
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- dotenv
- bcrypt

## ⚙️ Installation & Setup
1. Clone the repository
   ```bash
   git clone https://github.com/OmarRedaX/Social-media.git
   ```

2. Navigate to the project directory
   ```bash
   cd Social-media
   ```

3. Install dependencies
   ```bash
   npm install
   ```

4. Create a `.env` file and add the following:
   ```env
   PORT=5000
   DB_URI=your_database_connection_string
   JWT_SECRET=your_jwt_secret
   ```

5. Run the server
   ```bash
   npm start
   ```

## 📌 API Endpoints
| Method | Endpoint | Description |
|-------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/posts` | Get all posts |
| POST | `/api/posts` | Create a post |
| GET | `/api/posts/:id` | Get a single post |
| PUT | `/api/posts/:id` | Update a post |
| DELETE | `/api/posts/:id` | Delete a post |

## 🧪 Testing
You can test the APIs using Postman, Insomnia, or Thunder Client. Make sure to include the JWT token in the Authorization header for protected routes.

## 🤝 Contributing
Contributions are welcome. Fork the repository, create a new branch, commit your changes, push to the branch, and open a Pull Request.

## 👤 Author
**Omar Reda**  
GitHub: https://github.com/OmarRedaX
