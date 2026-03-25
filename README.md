# CourseTy

A course marketplace where users can browse and purchase courses, and admins can create and manage courses.

## Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT auth
- **Frontend**: React, Vite, TypeScript, React Router

## Setup

### Backend

1. `cd coursety/backend`
2. Copy `.env.example` to `.env` and fill in your values:
   - `MONGODB_URL` – MongoDB connection string
   - `USER_JWT_SECRET` – secret for user JWT tokens
   - `ADMIN_JWT_SECRET` – secret for admin JWT tokens
3. Run `npm install` then `npm start` (listens on port 3000)

### Frontend

1. `cd coursety/frontend`
2. Run `npm install` then `npm run dev` (runs on port 5173)

The Vite dev server proxies `/api` to `http://localhost:3000`.

## Features

- **Users**: Sign up/in, browse courses, purchase courses, view purchased courses
- **Admins**: Sign up/in, create and edit courses, view their courses
- Dark theme UI with responsive layout
