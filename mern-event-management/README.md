# Venue — MERN Event Management System

A production-ready full-stack event management platform. Organizers (admins) create and manage
events with image uploads to AWS S3; users browse, search, and reserve spots at events.

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (httpOnly cookie + bearer token fallback), role-based access control
- **File storage:** AWS S3 (event cover images)
- **Containerization:** Docker + Docker Compose

---

## Table of contents

1. [Features](#features)
2. [Project structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Local setup (without Docker)](#local-setup-without-docker)
5. [Running with Docker](#running-with-docker)
6. [Environment variables](#environment-variables)
7. [AWS S3 setup](#aws-s3-setup)
8. [API reference](#api-reference)
9. [Default admin account](#default-admin-account)
10. [Security notes](#security-notes)
11. [Deployment tips](#deployment-tips)

---

## Features

- **Authentication & authorization** — JWT-based signup/login, httpOnly cookies, `user` and
  `admin` roles, protected routes on both client and server.
- **Event CRUD** — Admins create, edit, and delete events; the public can browse, search, and
  filter by category or city.
- **Image upload** — Cover images are streamed directly to an S3 bucket via `multer-s3`; old
  images are cleaned up automatically on update/delete.
- **Registrations** — Authenticated users can reserve/cancel a spot; capacity is enforced
  server-side to prevent overbooking.
- **Admin dashboard** — Manage your own event listings and promote/demote user roles.
- **Responsive design** — Mobile-first Tailwind layout, accessible focus states, ticket-stub
  visual motif throughout.
- **Hardened API** — Helmet, CORS allowlist, rate limiting, centralized error handling, request
  validation with `express-validator`.

## Project structure

```
mern-event-management/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB & AWS S3 clients
│   │   ├── controllers/     # Route handlers (auth, events, users)
│   │   ├── middleware/      # Auth guard, upload, validation, error handling
│   │   ├── models/          # Mongoose schemas (User, Event)
│   │   ├── routes/          # Express routers
│   │   ├── utils/           # ApiError, token generator, seed script
│   │   └── server.js        # App entrypoint
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance
│   │   ├── components/      # layout / events / common
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Route-level views
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── nginx.conf           # Prod static hosting + API proxy
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- A MongoDB instance (local, Docker, or [MongoDB Atlas](https://www.mongodb.com/atlas))
- An AWS account with an S3 bucket (for image uploads)
- Docker + Docker Compose (optional, for containerized setup)

## Local setup (without Docker)

### 1. Backend

```bash
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, AWS_* values
npm install
npm run dev                # starts on http://localhost:5000
```

Optionally seed a default admin account:

```bash
npm run seed
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env       # VITE_API_URL=/api is fine for local dev (proxied by Vite)
npm install
npm run dev                 # starts on http://localhost:5173
```

Vite's dev server proxies `/api` requests to `http://localhost:5000` (see `vite.config.js`), so
no CORS configuration is needed locally.

## Running with Docker

```bash
cd mern-event-management
cp backend/.env.example backend/.env   # fill in JWT_SECRET and AWS_* values
docker compose up --build
```

This starts three services:

| Service    | URL                          | Notes                                  |
|------------|-------------------------------|-----------------------------------------|
| `mongo`    | `mongodb://localhost:27017`   | Persisted via the `mongo-data` volume   |
| `backend`  | `http://localhost:5000`       | Express API                            |
| `frontend` | `http://localhost:5173`       | Nginx serving the built React app, proxying `/api` to the backend |

Seed an admin user inside the running container if needed:

```bash
docker compose exec backend npm run seed
```

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | API port (default `5000`) |
| `CLIENT_URL` | Frontend origin, used for the CORS allowlist |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long, random secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `JWT_COOKIE_EXPIRES_IN` | Cookie lifetime in days |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | IAM credentials with S3 write access |
| `AWS_REGION` | S3 bucket region |
| `AWS_S3_BUCKET_NAME` | Target bucket for event images |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | API rate limiting config |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL the client calls, e.g. `/api` (dev) or `https://api.example.com/api` (prod) |

## AWS S3 setup

1. Create a bucket (e.g. `your-app-event-images`) in your preferred region.
2. Disable "Block all public access" only if you want images served directly from S3 URLs, or
   keep it private and put a CDN (e.g. CloudFront) in front of it — either works with this
   codebase since it stores the returned `Location` URL as-is.
3. Create an IAM user (or role) with a policy scoped to that bucket, minimally:
   `s3:PutObject`, `s3:DeleteObject`, `s3:GetObject` on `arn:aws:s3:::your-bucket/*`.
4. Add the generated access key/secret and bucket details to `backend/.env`.

## API reference

Base path: `/api`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create an account |
| POST | `/auth/login` | Public | Authenticate and receive a JWT |
| POST | `/auth/logout` | Private | Clear the session cookie |
| GET | `/auth/me` | Private | Get the current user |
| GET | `/events` | Public | List events (supports `search`, `category`, `city`, `upcoming`, `page`, `limit`) |
| GET | `/events/mine` | Private | Admin's own listings, or the user's registered events |
| GET | `/events/:id` | Public | Event details |
| POST | `/events` | Admin | Create an event (multipart form, field `image`) |
| PUT | `/events/:id` | Admin | Update an event |
| DELETE | `/events/:id` | Admin | Delete an event |
| POST | `/events/:id/register` | Private | Reserve a spot |
| DELETE | `/events/:id/register` | Private | Cancel a reservation |
| GET | `/users` | Admin | List users |
| PATCH | `/users/:id` | Admin | Update a user's role/active status |
| DELETE | `/users/:id` | Admin | Delete a user |
| GET | `/health` | Public | Health check |

## Default admin account

Run the seed script (`npm run seed` in `backend/`) to create an admin using the
`ADMIN_EMAIL` / `ADMIN_PASSWORD` environment variables (defaults to
`admin@example.com` / `ChangeMe123!` if unset). **Change the password immediately** after first
login in any non-local environment.

## Security notes

- Passwords are hashed with bcrypt (cost factor 12) and never returned in API responses.
- JWTs are stored in httpOnly, `SameSite=strict` cookies to reduce XSS/CSRF exposure; a bearer
  token is also issued for clients that need header-based auth.
- Helmet sets secure HTTP headers; CORS is restricted to `CLIENT_URL`.
- All write routes are protected by role-based middleware (`protect`, `authorize('admin')`).
- Input is validated with `express-validator`; Mongoose schema validation provides a second layer.
- Rate limiting is applied globally to `/api` to reduce brute-force and abuse risk.

## Deployment tips

- Set `NODE_ENV=production` and use strong, unique values for `JWT_SECRET`.
- Point `MONGO_URI` at a managed cluster (e.g. MongoDB Atlas) for production.
- Serve the frontend behind HTTPS (a reverse proxy like Nginx, or a platform like Vercel/Netlify)
  and set `VITE_API_URL` to your deployed API's public URL.
- If deploying frontend and backend on different origins, set `CLIENT_URL` accordingly and switch
  the cookie's `sameSite` policy to `none` with `secure: true` if cross-site cookies are required.
- Consider fronting the S3 bucket with CloudFront for faster, cached image delivery.
