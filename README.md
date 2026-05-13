# Guruji Backend

[![Build Status](https://img.shields.io/badge/tests-passing-brightgreen)](#)
[![License](https://img.shields.io/badge/license-ISC-blue)](#)

A lightweight job-consultancy backend API built with Node.js, Express and MongoDB (Mongoose). This repository contains REST endpoints for authentication, company/job listings, hiring partner management and application submission.

## Features

- JWT-based authentication with cookie storage
- Admin-protected routes for creating/updating/deleting companies and partners
- Company listing and job application flow with email notifications
- Rate limiting for protection against brute-force and abuse
- Basic input validation and defensive payload checks
- Configurable MongoDB connection pooling and timeouts
- ES Module (ESM) project structure

## Tech stack

- Node.js (ESM)
- Express
- MongoDB with Mongoose
- Jest + Supertest for tests
- Nodemailer for outgoing emails
- express-rate-limit for rate limiting

## Project structure

```
├── controller/
│   ├── applicationController.js   # job application handler (sends emails)
│   └── company.controller.js      # company CRUD + listing
├── middleware/
│   ├── auth.js                    # JWT cookie-based auth middleware
│   └── ratelimiter.js             # global and auth rate limits
├── models/
│   ├── company.model.js           # Company schema + indexes
│   ├── hiringpartner.model.js     # HiringPartner schema
│   └── user.js                    # User schema
├── Routes/
│   ├── auth.js                    # /signup, /login, /logout
│   ├── company.route.js           # company CRUD + apply + list + jobs
│   └── hiringPartner.js           # partner create/list/delete
├── __tests__/                      # integration tests (Jest + Supertest)
├── database.js                     # mongoose connection (pooling options)
├── index.js                         # app entry (Express setup)
├── jest.config.js                   # jest config (ESM-aware)
├── package.json
└── docs/
    └── optimizations.md            # optimization notes
```

## Installation

Prerequisites:

- Node.js 18+ recommended
- MongoDB instance (URI)

Clone and install:

```bash
git clone <repo-url>
cd guruji-backend
npm install
```

## Environment variables

Create a `.env` file in the project root (example values):

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/guruji
JWT_SECRET=replace_with_strong_secret
FRONTEND=http://localhost:3000
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your-email-password
ALLOW_ADMIN_REGISTRATION=true

# Optional tuning
MONGO_MAX_POOL_SIZE=20
MONGO_SERVER_SELECTION_MS=5000
MONGO_SOCKET_TIMEOUT_MS=45000
GLOBAL_RATE_MAX=300
RATE_LIMIT_AUTH_MAX=5
```

Notes:

- `ALLOW_ADMIN_REGISTRATION` controls whether `/signup` endpoint can create admin users (must be set to `true` to allow admin registration).
- All secret values (JWT*SECRET, EMAIL*\*) should be managed securely (secret manager or environment injection during deployment).

## Development

Run app in development with auto-reload:

```bash
npm run dev
```

Start normally:

```bash
npm start
```

Run tests:

```bash
npm test
```

## Available scripts

- `npm start` — start production server (`node index.js`)
- `npm run dev` — start with `nodemon` for development
- `npm test` — run Jest test suite (configured for ESM)

## Detected API endpoints

The README documents endpoints as implemented in the `Routes/` directory. All endpoints are rooted at `/` (no API version prefix in current code).

### Authentication

- POST /signup
  - Description: Register an admin user (guarded by `ALLOW_ADMIN_REGISTRATION`).
  - Request body:
    ```json
    {
      "email": "admin@example.com",
      "password": "StrongP@ssw0rd"
    }
    ```
  - Responses:
    - 201 Created: `{ message: "User registered successfully", data: { ...user } }` (password excluded)
    - 400 Bad Request: when required fields missing or email exists
    - 403 Forbidden: if admin registration is disabled

- POST /login
  - Description: Login and set a cookie named `token` containing JWT.
  - Request body:
    ```json
    { "email": "admin@example.com", "password": "StrongP@ssw0rd" }
    ```
  - Responses:
    - 200 OK: `{ message: "Login successful", data: { ...userWithoutPassword } }` and sets cookie `token`
    - 400 Bad Request: invalid credentials or missing fields

- GET /logout
  - Description: Clears `token` cookie.
  - Response: `Logout Successful!!` (plain text)

### Companies

- POST /create (protected — admin)
  - Body fields (example):
    ```json
    {
      "name": "Example Co",
      "industry": "Tech",
      "location": "San Francisco",
      "role": "Software Engineer",
      "experience": "3+ years",
      "salary": "100k-150k",
      "openings": 2,
      "working_hours": "9-5",
      "working_days": "Mon-Fri",
      "description": "Job description...",
      "is_active": true
    }
    ```
  - Responses:
    - 201 Created: company object
    - 400 Bad Request: validation errors

- DELETE /delete/:id (protected — admin)
  - Description: Delete company by ID
  - Responses: 200 OK on success, 404 Not found if missing

- PUT /update/:id (protected — admin)
  - Description: Update company fields (same fields as create)
  - Responses: 200 OK with updated company

- GET /list
  - Description: Returns list of companies (projected fields)
  - Response example:
    ```json
    {
      "success": true,
      "count": 3,
      "data": [
        {
          "name": "A",
          "industry": "Tech",
          "location": "X",
          "role": "Dev",
          "experience": "Fresher",
          "openings": 1,
          "is_active": true
        }
      ]
    }
    ```

- GET /jobs/:id
  - Description: Get company/job details by id
  - Response: company object

- POST /apply/:jobId
  - Description: Application endpoint; sends email to admin and confirmation to applicant.
  - Request body:
    ```json
    {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "message": "I am interested",
      "companyName": "Example Co",
      "jobRole": "Software Engineer"
    }
    ```
  - Responses: 200 OK on success, 500 on mail or server error

### Hiring Partners

- POST /partner/create (protected — admin)
  - Body: `{ "name": "Partner Name" }`
  - Responses: 201 Created with created partner

- GET /partner/list
  - Description: list of hiring partners
  - Response: array of partner objects

- DELETE /partner/delete/:id (protected — admin)
  - Description: delete partner by id

## Authentication flow

- Users have `email` and `password` fields stored in `User` model.
- On login, the server signs a JWT containing `{ id: user._id }` with `process.env.JWT_SECRET` (expires in 90 days) and sets it as a cookie named `token`.
- Protected routes use `middleware/auth.js` which reads `req.cookies.token`, verifies the JWT and loads the user (`User.findById`) — the user object is attached to `req.user`.

## Database setup & configuration

- Connect via `MONGO_URI`.
- Connection pooling and timeouts are configurable via:
  - `MONGO_MAX_POOL_SIZE` (default 20)
  - `MONGO_SERVER_SELECTION_MS` (default 5000)
  - `MONGO_SOCKET_TIMEOUT_MS` (default 45000)
- Indexes added:
  - `Company`: `createdAt` (-1), `name` (1), `role` (1), text index on `{ name, role, description }`.
  - `HiringPartner`: `name` (1)
  - `User`: `email` has `unique: true` on schema.

## Usage examples (curl)

Signup (admin registration must be enabled):

```bash
curl -X POST http://localhost:5000/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Secret123!"}'
```

Login (sets cookie):

```bash
curl -i -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Secret123!"}'
```

List companies:

```bash
curl http://localhost:5000/list
```

Apply to a job:

```bash
curl -X POST http://localhost:5000/apply/605c6f9f1c4ae2a1f0e7b123 \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Jane","email":"jane@example.com","phone":"1234567890","companyName":"Example Co","jobRole":"Dev"}'
```

## Deployment

- Use environment variables for secrets; never commit `.env`.
- For multiple app instances, use a central Redis store for rate limiting (instead of the default in-memory store).
- Create indexes in production with `background: true` to avoid write blocking.
- Ensure `JWT_SECRET` is strong and rotated periodically.

## Performance optimizations applied

- Added `.lean()` to read-only queries to reduce Mongoose overhead.
- Added projections (`.select()`) for listing operations to avoid over-fetching.
- Added indexes on frequently queried and sorted fields.
- Database connection pooling and timeouts are configurable by env variables.
- Rate limiter thresholds are configurable and relaxed in test environment to avoid false positives.

See `docs/optimizations.md` for more details and monitoring instructions.

## Error handling

- API returns JSON with `{ success: boolean, message: string }` for many endpoints.
- Status codes used: 200, 201, 400, 401, 403, 404, 413, 429, 500.
- Add centralized error middleware in future iterations for consistent shapes.

## Security considerations

- Passwords are stored hashed (bcrypt); password hashes are never sent in API responses.
- JWTs are signed with `JWT_SECRET` and stored in HTTP cookies (ensure `secure` and `httpOnly` flags in production behind HTTPS).
- Rate limiting is in place; use Redis store for cluster environments.
- Validate and sanitize all user input in future for robust protection against injection.

## Screenshots

Placeholder: add client screenshots or example Postman collection here.

## Future improvements

- Add Redis-backed rate limiter for clustered deployments.
- Add request/response logging (pino/winston) and structured logs.
- Add metrics and tracing (Prometheus/OpenTelemetry) to measure DB op timings and latency.
- Add API versioning and OpenAPI/Swagger spec.
- Replace cookie-based JWT storage with secure cookie options and refresh token flow if needed.
- Add centralized error handling and validation (Joi or celebrate).

## Contributing

- Fork this repository and open PRs for features or fixes.
- Run tests locally with `npm test` and keep changes isolated.

## License

This project uses the ISC license (see `package.json`).

---

