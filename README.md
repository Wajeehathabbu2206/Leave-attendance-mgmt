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
DEMO_PASSWORD=use-a-unique-demo-password-at-least-12-chars
```
Seed the first admin account after MongoDB is available:

```bash
npm run seed --prefix server
```

To create a fictional, linked school dataset for local demos, set
`DEMO_PASSWORD` in `server/.env` to a unique password of at least 12 characters,
then run:

```bash
npm run seed:demo --prefix server
```

The demo seeder is repeatable and does not delete records. It creates sample
teachers, students, guardians, class sections, timetables, leave balances,
attendance, and student leave requests for teacher review. Dates cover August
through October of the academic year (attendance stops at today if run during
that period). One student's attendance is deliberately below 75%, so the
linked guardian dashboard shows the existing attendance warning. Demo accounts
use reserved `markmyday.example` email addresses and share the configured
`DEMO_PASSWORD`; use only in a development or demo database. Set
`DEMO_DATA_YEAR` to choose the August start year explicitly.

Authentication endpoints are available at `/api/auth/login`, `/api/auth/me`, and `/api/auth/register`. Public registration creates teacher, student, or parent accounts; admin accounts are created through the seed script.

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
