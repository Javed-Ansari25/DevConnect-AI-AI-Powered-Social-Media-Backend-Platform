# DevConnect AI

DevConnect AI is a production-level backend application built using Node.js, Express.js, MongoDB, and Socket.IO.

The platform provides secure authentication with JWT access & refresh tokens, role-based authorization, realtime communication, AI-powered chat & suggestions using Groq AI, and media uploads using Multer and Cloudinary.

The project follows scalable backend architecture with modular routing, MVC pattern, centralized error handling, middleware-based security, and realtime WebSocket communication.

## Features

- User Authentication & Authorization
- JWT Access & Refresh Token Flow
- Google OAuth Login
- Role-Based Access Control (User/Admin)
- Profile & Post Image Uploads
- Cloudinary Media Storage
- Realtime Chat with Socket.IO
- Groq AI Chat & Suggestions
- Protected Routes & Middleware
- Scalable MVC Architecture
- RESTful APIs
- Centralized Error Handling

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Passport.js
- Socket.IO
- Multer
- Cloudinary
- Groq AI
- bcrypt
- cookie-parser

## Architecture

Client
   ↓
Express API
   ↓
Authentication Middleware
   ↓
Controllers
   ↓
Services
   ↓
MongoDB / Cloudinary / Groq AI
   ↓
Socket.IO Realtime Layer

## Future Improvements

- Redis Caching
- Docker Support
- CI/CD Pipeline
- Group Chats
- Notifications
- AI Content Moderation
- Video Upload Support