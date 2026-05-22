# DevConnect AI

DevConnect AI is a production-grade social media and realtime communication backend platform built with Node.js, Express.js, MongoDB, and Socket.IO.

The platform provides secure authentication, scalable social features, realtime messaging, AI-powered interactions, media management, and production-level backend architecture following industry best practices.

It includes JWT-based authentication, Google OAuth, role-based authorization, follow/follower system, post management, realtime chat, AI integrations using Groq AI, Cloudinary media storage, and scalable REST APIs.

The project follows a modular MVC architecture with centralized error handling, middleware-driven security, reusable utilities, and scalable database design optimized for modern social media applications.

---

# Core Features

## Authentication & Security

- JWT Access & Refresh Token Authentication
- Secure Cookie-Based Token Storage
- Google OAuth Authentication
- Password Hashing using bcrypt
- Protected Routes & Authorization Middleware
- Role-Based Access Control (User/Admin)
- Refresh Token Rotation
- OTP Verification System
- Secure API Validation & Error Handling

---

## User Management

- User Registration & Login
- Profile Management
- Avatar & Cover Image Upload
- User Search Functionality
- Public User Profiles
- Follow / Unfollow System
- Followers & Following Pagination
- Follow Status Checking
- User Suggestions

---

## Social Media Features

- Create, Update & Delete Posts
- Image Upload Support
- Like / Unlike Posts
- Comment System
- Nested Replies Support
- Saved Posts
- Feed Generation
- Pagination & Infinite Scroll APIs
- Trending & Recommended Posts

---

## Realtime Features

- Realtime Chat using Socket.IO
- Online / Offline Presence
- Typing Indicators
- Realtime Notifications
- Instant Message Delivery
- Realtime Event Broadcasting

---

## AI Features

- Groq AI Chat Integration
- AI-Based Suggestions
- Smart Content Assistance
- AI Prompt Handling APIs

---

## Media Management

- Cloudinary Media Storage
- Multer File Upload Handling
- Optimized Image Upload Pipeline
- Secure File Validation

---

## Backend Architecture

- Production-Level MVC Architecture
- Modular Route Structure
- Centralized Error Handling
- Async Handler Wrapper
- Reusable API Response Structure
- Environment-Based Configuration
- Scalable Database Design
- RESTful API Standards
- Middleware-Based Request Flow
- Clean Code Separation

---

# Tech Stack

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

---

## Authentication & Security

- JWT
- bcrypt
- Passport.js
- cookie-parser

---

## Realtime Communication

- Socket.IO

---

## File & Media Handling

- Multer
- Cloudinary

---

## AI Integration

- Groq AI

---

# Project Architecture

```txt
Client Application
        │
        ▼
Express REST API
        │
        ▼
Authentication & Security Middleware
        │
        ▼
Controllers Layer
        │
        ▼
Business Logic / Services
        │
        ▼
Database & External Services
(MongoDB / Cloudinary / Groq AI)
        │
        ▼
Socket.IO Realtime Layer
```

---

# Database Design

## Main Collections

```txt
users
posts
comments
likes
follows
messages
notifications
```

---

## Follow System Design

The application uses a normalized follow relationship model.

Each follow connection is stored as a separate document:

```js
{
   follower: ObjectId,
   following: ObjectId
}
```

This architecture provides:

- Better scalability
- Optimized pagination
- Faster relationship queries
- Improved analytics support
- Production-level social graph design

---

# API Features

- RESTful API Design
- Pagination Support
- Filtering & Sorting
- Search APIs
- Secure Protected Endpoints
- Structured JSON Responses
- Global Error Handling
- Validation Middleware

---

# Security Practices

- HTTP-Only Cookies
- Password Hashing
- JWT Verification
- Request Validation
- Protected Middleware
- Role-Based Authorization
- Secure File Upload Validation
- Environment Variable Protection

---

# Scalability Considerations

- Modular Folder Structure
- Separation of Concerns
- Reusable Utilities
- Database Indexing
- Async Concurrent Queries using Promise.all
- Optimized Pagination Queries
- Realtime Event Separation

---

---

# Author

Developed as a production-level backend architecture project focused on scalable social media systems, realtime communication, and AI-powered backend services.
