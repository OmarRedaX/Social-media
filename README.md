# 🌐 Social Media Backend API

A **scalable and secure backend API** for a social media application, built with **Node.js**, **Express.js**, and **MongoDB**, with support for **REST APIs** and **GraphQL**.

Designed with clean architecture, reusable modules, and production-ready practices.

---

## 🚀 Features

- 🔐 User Authentication & Authorization (JWT)
- 👤 User Profiles & Friends System
- 📝 Posts & Feeds
- ❤️ Likes & Interactions
- 💬 Comments System
- 🕵️ Privacy & Secure Data Handling
- ⚡ RESTful APIs + GraphQL Support
- 🧱 Clean Backend Architecture

---

## 🧰 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- GraphQL
- JWT Authentication
- bcrypt
- dotenv

### Tools
- Git & GitHub
- Postman / Insomnia
- Nodemon

---

## 📁 Project Structure

Social-media/
│
├── src/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middlewares/
│ ├── graphql/
│ ├── utils/
│ └── app.js
│
├── .env
├── package.json
└── README.md

---

## ⚙️ Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/OmarRedaX/Social-media.git
cd Social-media
```
2️⃣ Install dependencies
npm install

3️⃣ Environment Variables
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

4️⃣ Run the server
npm run dev

## Server will run on
http://localhost:3000

---

## 🔗 API Endpoints (REST)

| Method | Endpoint | Description |
|------|--------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/users/:id` | Get user profile |
| POST | `/api/posts` | Create post |
| GET | `/api/posts` | Get all posts |

## 🧠 GraphQL

### Supported Queries
- `getProfile`
- `postList`
- `userList`

### GraphQL Playground

## 🧪 Testing

You can test the APIs using:
- Postman
- Insomnia
- GraphQL Playground

## 📌 Future Improvements

- Notifications system
- Real-time chat (Socket.io)
- Stories feature
- Advanced privacy controls
- Rate limiting & caching

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/my-feature
3. Push to the branch

4. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Omar Reda Tawfik**  
GitHub: https://github.com/OmarRedaX  

Full Stack MERN Developer  
Focused on Backend Architecture & Clean Code  

---

⭐ If you like this project, don’t forget to give it a star!

