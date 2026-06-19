# CourseTy

A full-featured course marketplace where learners browse and purchase courses, watch video lessons, and track progress. Instructors build curricula and manage courses. Admins approve instructor requests and manage roles.

## Features

- Single user model with three roles: `learner`, `instructor`, `admin`.
- Email + password auth (bcrypt + JWT, 7-day expiry).
- **Razorpay payments** for paid courses; free enrollment when price is ₹0.
- **Course curriculum** with sections, lessons, and video playback (YouTube, Vimeo, or direct MP4).
- **Learning experience** with video player, lesson sidebar, progress tracking, and completion.
- Learners can browse published courses, purchase/enroll, and watch from My Courses.
- Learners can request instructor access; admins approve or reject requests.
- Instructors can create, edit, publish/unpublish, delete courses and build curricula.
- Admins can list users and change roles directly.
- Hardened backend: `helmet`, CORS allowlist, rate-limited auth, request validation with `zod`.

## Tech Stack

- Backend: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, zod, Razorpay
- Frontend: React 18, Vite, TypeScript, React Router

## Project structure

```
coursety/
  backend/
    index.js
    db.js                   # User, Course, Purchase, Order, LessonProgress
    utils/access.js
    middleware/auth.js
    routes/
      auth.js
      course.js             # courses, curriculum, lessons, progress
      payment.js            # Razorpay create-order + verify
      instructor.js
      admin.js
  frontend/
    src/
      api.ts
      utils/format.ts, video.ts
      components/CurriculumBuilder.tsx, Layout.tsx
      pages/CourseLearn.tsx, CourseDetail.tsx, ...
```

## API overview

Base URL: `/api/v1`

### Auth
- `POST /auth/signup` → `{ token, user }`
- `POST /auth/signin` → `{ token, user }`
- `GET  /auth/me` → `{ user }` (auth)

### Courses
- `GET  /courses` → published courses with lesson counts
- `GET  /courses/:id` → course detail + enrolled status
- `GET  /courses/:id/curriculum` → sections/lessons (preview lessons public)
- `GET  /courses/:id/lessons/:lessonId` (auth) → lesson with video URL
- `POST /courses/:id/lessons/:lessonId/complete` (auth) → mark complete
- `POST /courses/:id/enroll` (auth) → free courses only
- `GET  /courses/:id/access` (auth) → `{ access: boolean }`
- `GET  /courses/me/purchases` (auth)

### Payments (Razorpay)
- `POST /payments/create-order` (auth) body `{ courseId }`
- `POST /payments/verify` (auth) body `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`

### Instructor
- `POST /instructor/request` (auth)
- `GET  /instructor/request` (auth)
- `GET  /instructor/courses` (instructor/admin)
- `POST /instructor/courses` (instructor/admin)
- `PUT  /instructor/courses/:id` (instructor/admin)
- `PUT  /instructor/courses/:id/curriculum` (instructor/admin)
- `DELETE /instructor/courses/:id`

### Admin
- `GET  /admin/instructor-requests?status=pending|approved|rejected`
- `POST /admin/instructor-requests/:id/approve`
- `POST /admin/instructor-requests/:id/reject`
- `GET  /admin/users`
- `POST /admin/users/:id/role` body `{ role }`
- `GET  /admin/courses`

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Razorpay test account ([dashboard.razorpay.com](https://dashboard.razorpay.com))

### Backend

```bash
cd backend
cp .env.example .env
# fill MONGODB_URL, JWT_SECRET, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
npm install
npm run dev
```

API listens on `http://localhost:3000`.

#### Environment variables
| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URL` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `RAZORPAY_KEY_ID` | For paid courses | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | For paid courses | Razorpay key secret |
| `PORT` | No | Default `3000` |
| `CORS_ORIGIN` | No | e.g. `http://localhost:5173` |

#### Promoting your first admin

```bash
cd backend
node scripts/makeAdmin.js you@example.com
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite runs on `http://localhost:5173` and proxies `/api` to the backend.

## Typical flow

1. Sign up at `/signup` as a learner.
2. Browse `/courses`, preview free lessons, then enroll (free) or buy via Razorpay (paid).
3. Watch lessons at `/courses/:id/learn` with progress tracking.
4. To teach: `/become-instructor` → admin approves at `/admin/requests`.
5. Instructors create courses at `/instructor`, add curriculum in the edit page, publish.
6. Use Razorpay **test mode** keys and test card `4111 1111 1111 1111` for payments.

## Video URLs

Instructors can use:
- YouTube: `https://www.youtube.com/watch?v=VIDEO_ID`
- Vimeo: `https://vimeo.com/VIDEO_ID`
- Direct MP4: `https://example.com/video.mp4`

Mark lessons as **Free preview** so non-enrolled users can watch them from the course page.

## License

MIT — see [LICENSE](LICENSE).
