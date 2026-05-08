# CourseTy

A course marketplace web app where learners browse and enroll in courses, instructors manage their own courses, and admins approve instructor requests and manage roles.

> Status: portfolio / MVP project. Payments (Stripe), email verification, and content delivery are intentionally out of scope; the data model is shaped so they can plug in later.

## Features

- Single user model with three roles: `learner`, `instructor`, `admin`.
- Email + password auth (bcrypt + JWT, 7-day expiry).
- Learners can browse published courses and enroll (free for now).
- Learners can request instructor access; admins approve or reject requests.
- Instructors can create, edit, publish/unpublish, and delete their own courses (price, thumbnail, description, etc.).
- Admins can list users and change roles directly.
- Hardened backend: `helmet`, CORS allowlist, rate-limited auth, request validation with `zod`.
- Modern, responsive UI in React + Vite + TypeScript with a clean education-style theme.

## Tech Stack

- Backend: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, zod, helmet, express-rate-limit
- Frontend: React 18, Vite, TypeScript, React Router

## Project structure

```
coursety/
  backend/
    index.js                # Express app entry + middleware + DB bootstrap
    db.js                   # Mongoose models: User, InstructorRequest, Course, Purchase
    middleware/auth.js      # authRequired, requireRole, optionalAuth
    routes/
      auth.js               # /auth/signup, /auth/signin, /auth/me
      course.js             # /courses (public + enroll + access)
      instructor.js         # /instructor/request, /instructor/courses CRUD
      admin.js              # /admin/instructor-requests, /admin/users
    scripts/makeAdmin.js    # CLI to promote a user to admin
  frontend/
    src/
      api.ts                # Typed client for backend API
      context/AuthContext.tsx
      components/Layout.tsx, AuthForm.tsx
      pages/                # Home, Courses, CourseDetail, SignIn, SignUp,
                            # Purchases, BecomeInstructor, InstructorDashboard,
                            # InstructorCreateCourse, InstructorEditCourse,
                            # AdminRequests, AdminUsers
```

## API overview

Base URL: `/api/v1`

Auth
- `POST /auth/signup` -> `{ token, user }`
- `POST /auth/signin` -> `{ token, user }`
- `GET  /auth/me` -> `{ user }` (auth)

Courses
- `GET  /courses` -> public, only published
- `GET  /courses/:id` -> public if published, else creator/admin only
- `POST /courses/:id/enroll` (auth) -> creates a Purchase
- `GET  /courses/:id/access` (auth) -> `{ access: boolean }`
- `GET  /courses/me/purchases` (auth)

Instructor
- `POST /instructor/request` (auth) -> request instructor role
- `GET  /instructor/request` (auth) -> latest own request
- `GET  /instructor/courses` (instructor/admin)
- `POST /instructor/courses` (instructor/admin)
- `PUT  /instructor/courses/:id` (instructor/admin, must be creator unless admin)
- `DELETE /instructor/courses/:id`

Admin
- `GET  /admin/instructor-requests?status=pending|approved|rejected`
- `POST /admin/instructor-requests/:id/approve`
- `POST /admin/instructor-requests/:id/reject`
- `GET  /admin/users`
- `POST /admin/users/:id/role` body `{ role }`
- `GET  /admin/courses`

Health
- `GET  /health` -> `{ status, db, uptime }`

## Setup

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local or Atlas)

### Backend

```bash
cd backend
cp .env.example .env
# fill MONGODB_URL and JWT_SECRET
npm install
npm run dev
```

The API listens on `http://localhost:3000` by default.

#### Environment variables
- `MONGODB_URL` - MongoDB connection string (required)
- `JWT_SECRET` - long random string used to sign JWTs (required)
- `PORT` - default `3000`
- `CORS_ORIGIN` - comma-separated allowlist (e.g. `http://localhost:5173`); defaults to allow-all in dev

#### Promoting your first admin

After signing up a normal account in the UI, run:

```bash
cd backend
node scripts/makeAdmin.js you@example.com
```

That account can now visit `/admin/requests` and `/admin/users` in the UI.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api` to the backend.

## Typical flow

1. Visitor signs up at `/signup` and becomes a `learner`.
2. Learner browses `/courses` and clicks "Enroll" on a published course.
3. Learner who wants to teach goes to `/become-instructor` and submits a request.
4. Admin (created via `makeAdmin.js`) opens `/admin/requests` and approves/rejects.
5. Approved instructors see "Instructor" in nav and use `/instructor` to create and publish courses.

## Roadmap (intentionally not in this repo)

- Stripe Checkout + webhooks for paid enrollments
- Course curriculum (sections, lessons, attachments) and video hosting with signed URLs
- Email verification, password reset, refresh tokens
- Search, filters, categories
- Tests, CI, Docker

## License

MIT - see [LICENSE](LICENSE).
