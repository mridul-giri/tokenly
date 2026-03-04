# Tokenly

A plug-and-play authentication package for Express.js applications. Tokenly handles **user signup, login, logout, password management, and account deletion** out of the box — with built-in JWT authentication, Redis-backed token storage, and rate limiting.

Supports both **MongoDB (Mongoose)** and **PostgreSQL (Prisma)** via a simple adapter pattern.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Quick Start](#quick-start)
  - [With MongoDB](#with-mongodb)
  - [With Prisma (PostgreSQL)](#with-prisma-postgresql)
- [API Routes](#api-routes)
- [Request & Response Reference](#request--response-reference)

---

## Features

- 🔐 **JWT Authentication** — Tokens are signed, verified, and stored in Redis with a 7-day TTL
- 🛡️ **Rate Limiting** — Redis-based per-route, per-IP rate limiting (5 requests / 30 seconds)
- 🔑 **Password Hashing** — Bcrypt-based password hashing and verification
- 📧 **Email Validation** — Validates email format _and_ checks MX records for real domains
- 🔌 **Database Support** — Built-in adapters for MongoDB (Mongoose) and PostgreSQL (Prisma)
- 🚀 **Zero Controller Code** — Just create an instance and mount the router

---

## Prerequisites

- **Node.js** ≥ 18
- **Redis** server running (used for token storage + rate limiting)
- **MongoDB** or **PostgreSQL** (depending on your adapter choice)

---

## Installation

```bash
npm install tokenly
```

**Dependencies** (installed automatically):

| Package          | Purpose               |
| ---------------- | --------------------- |
| `express`        | HTTP server / routing |
| `jsonwebtoken`   | JWT creation & verify |
| `bcrypt`         | Password hashing      |
| `redis`          | Token store & limiter |
| `mongoose`       | MongoDB adapter       |
| `@prisma/client` | Prisma adapter        |

---

## Environment Variables

Create a `.env` file in your project root:

```env
JWT_SECRET="your-super-secret-key"

# MongoDB (if using MongoDB adapter)
MONOGO_URI="mongodb://localhost:27017/your-db"

# PostgreSQL (if using Prisma adapter)
DATABASE_URL="postgresql://user:password@localhost:5432/your-db"

# Optional
SALT_ROUNDS=10        # bcrypt salt rounds, defaults to 10
```

> [!IMPORTANT]
> `JWT_SECRET` is **required**. The package will throw **Internal server error** if it is not set.

---

## Quick Start

### With MongoDB

**1. Define your Mongoose User model**

Your model must include these four fields: `name`, `userName`, `email`, and `password`.

```ts
// models/user.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  password: { type: String, required: true },
});

export default mongoose.model("User", UserSchema);
```

**2. Connect to MongoDB, Redis, and mount the auth router**

```ts
// app.ts
import express from "express";
import mongoose from "mongoose";
import { createClient, type RedisClientType } from "redis";
import { Tokenly } from "tokenly";
import { mongoDBAdapter } from "tokenly/adapters/mongoDBAdapter";
import UserModel from "./models/user.js";

const app = express();
app.use(express.json());

const redisClient: RedisClientType = createClient();
redisClient.on("error", (err) => console.error("[Redis]", err));

(async () => {
  try {
    // 1. Connect MongoDB
    await mongoose.connect(
      process.env.MONOGO_URI || "mongodb://localhost:27017/myapp",
    );
    console.log("MongoDB connected");
    // 2. Connect Redis
    await redisClient.connect();
    console.log("Redis connected");
  } catch (error) {
    console.eror("Connection Failed", error);
  }
})();

// 3. Create Tokenly instance
const auth = new Tokenly({
  adapter: mongoDBAdapter(UserModel),
  redis: redisClient,
});

// 4. Mount auth routes
app.use("/api/auth", auth.router());

app.listen(3000, () => console.log("Server running on port 3000"));
```

That's it. You now have a fully functional auth API at `/api/auth`.

---

### With Prisma (PostgreSQL)

**1. Define the Prisma schema**

Your `User` model must include: `id`, `name`, `userName`, `email`, and `password`.

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id       String  @id @default(uuid())
  name     String?
  userName String
  email    String  @unique
  password String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

```bash
npx prisma migrate dev --name init
```

**2. Set up the Prisma client and mount the auth router**

```ts
// app.ts
import express from "express";
import { createClient, type RedisClientType } from "redis";
import { PrismaClient } from "./generated/prisma/client.js";
import { Tokenly } from "tokenly";
import { prismaAdapter } from "tokenly/adapters/prismaAdapter";

const app = express();
app.use(express.json());

// 1. Prisma client
const prisma = new PrismaClient();

const redisClient: RedisClientType = createClient();
redisClient.on("error", (err) => console.error("[Redis]", err));

(async () => {
  try {
    // 2. Connect Redis
    await redisClient.connect();
    console.log("Redis connected");
  } catch (error) {
    console.eror("Connection Failed", error);
  }
})();

// 3. Create Tokenly instance
const auth = new Tokenly({
  adapter: prismaAdapter(prisma),
  redis: redisClient,
});

// 4. Mount auth routes
app.use("/api/auth", auth.router());

app.listen(3000, () => console.log("Server running on port 3000"));
```

---

## API Routes

Once you mount the router with `app.use("/api/auth", auth.router())`, the following endpoints are available:

| Method   | Endpoint                    | Auth Required | Description              |
| -------- | --------------------------- | :-----------: | ------------------------ |
| `POST`   | `/api/auth/signup`          |      ❌       | Register a new user      |
| `GET`    | `/api/auth/login`           |      ❌       | Login & receive JWT      |
| `GET`    | `/api/auth/me`              |      ✅       | Get current user profile |
| `PATCH`  | `/api/auth/change-password` |      ✅       | Change password          |
| `POST`   | `/api/auth/logout`          |      ✅       | Logout & invalidate JWT  |
| `DELETE` | `/api/auth/delete`          |      ✅       | Delete user account      |

> All routes are rate-limited to **5 requests per 30 seconds** per IP per route.

### Authentication

For protected routes, send the JWT in the `Authorization` header:

```
Authorization: <your-jwt-token>
```

> [!NOTE]
> The token is sent as a raw string, **not** as a `Bearer` token.

---

## Request & Response Reference

### POST `/signup`

**Request Body:**

```json
{
  "name": "John Doe",
  "userName": "johndoe",
  "email": "john@example.com",
  "password": "my-secure-password"
}
```

**Responses:**

| Status | Body                                             |
| ------ | ------------------------------------------------ |
| `201`  | `{ "message": "Account created successfully." }` |
| `400`  | `{ "message": "Invalid email" }`                 |
| `401`  | `{ "message": "Body can not be empty" }`         |
| `409`  | `"User already exists"`                          |

---

### GET `/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "my-secure-password"
}
```

**Success Response (200):**

```json
{
  "message": "Login Successful, Token is valid for 7 days",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "abc123",
    "email": "john@example.com",
    "userName": "johndoe",
    "name": "John Doe"
  }
}
```

**Error Responses:**

| Status | Body                                                  |
| ------ | ----------------------------------------------------- |
| `401`  | `{ "message": "Email or Password can not be empty" }` |
| `401`  | `{ "message": "Wrong password" }`                     |
| `404`  | `{ "message": "User not found" }`                     |

---

### GET `/me`

**Headers:** `Authorization: <token>`

**Success Response (200):**

```json
{
  "user": {
    "id": "abc123",
    "userName": "johndoe",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### PATCH `/change-password`

**Headers:** `Authorization: <token>`

**Request Body:**

```json
{
  "oldPassword": "my-old-password",
  "newPassword": "my-new-password"
}
```

**Responses:**

| Status | Body                                                             |
| ------ | ---------------------------------------------------------------- |
| `200`  | `{ "message": "password changed" }`                              |
| `401`  | `{ "message": "Old Password or New Password can not be empty" }` |
| `401`  | `{ "message": "Wrong old password" }`                            |

---

### POST `/logout`

**Headers:** `Authorization: <token>`

**Success Response (200):**

```json
{ "message": "Token deleted successfully" }
```

> The JWT is deleted from Redis, immediately invalidating it.

---

### DELETE `/delete`

**Headers:** `Authorization: <token>`

**Request Body:**

```json
{
  "password": "my-secure-password"
}
```

**Responses:**

| Status | Body                                         |
| ------ | -------------------------------------------- |
| `200`  | `{ "message": "User deleted successfully" }` |
| `401`  | `{ "message": "Password can not be empty" }` |
| `401`  | `{ "message": "Wrong password" }`            |

---

**How it works:**

1. You create a `Tokenly` instance with a **database adapter** and a **Redis client**
2. Calling `auth.router()` returns an Express Router with all auth routes pre-configured
3. Every route is protected by a **rate limiter** (Redis-backed)
4. Protected routes run through the **authentication middleware** which:
   - Decodes the JWT from the `Authorization` header
   - Verifies the token against the copy stored in Redis
   - Fetches the full user via the adapter and attaches it to `req.user`
5. Tokens are stored in Redis with a `token:{userId}` key and a **7-day expiration**
6. On logout or account deletion, the token is immediately removed from Redis
