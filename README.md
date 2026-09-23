# MarkMyDay

Leave & Attendance Management portal for schools.

## Stack

- **Server:** Node.js, Express, Mongoose, ES modules
- **Client:** React, Vite, Tailwind CSS, React Router

## Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB connection string

## Setup

Install dependencies from the repository root:

```bash
npm run install:all
```

Create `server/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/markmyday
JWT_SECRET=replace-with-a-long-random-secret
PORT=5050
ADMIN_NAME=MarkMyDay Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-admin-password
```
Seed the first admin account after MongoDB is available:

```bash
npm run seed --prefix server
```

Authentication endpoints are available at `/api/auth/login`, `/api/auth/me`, and the admin-only `/api/auth/register`.

The client uses `VITE_API_URL` when provided and otherwise targets `http://localhost:5050/api`.

## Run both apps

```bash
npm run dev
```

The client runs at `http://localhost:5173` and the API runs at `http://localhost:5050`.

The client health page calls `GET /api/health` and displays the response.

## Run separately

```bash
npm run dev --prefix server
npm run dev --prefix client
```
