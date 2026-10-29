# CampusFix — Smart College Issue Reporting System

Report. Track. Resolve. A full-stack app for students/staff to report campus infrastructure issues
(broken fans, leaks, Wi-Fi problems, etc.) and for admins/maintenance staff to triage and resolve them.

**Status: Backend (Stage 1) complete and runnable. Frontend (Stage 2) not yet built.**

## Stack

- Frontend: React + Vite, Tailwind CSS *(next stage)*
- Backend: Node.js + Express
- ORM / DB: Prisma + PostgreSQL
- Auth: JWT + bcrypt

## Folder structure

```
campusfix/
├── backend/            # Express API (this stage)
│   ├── prisma/         # schema.prisma, seed.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/  # authenticate, authorize, upload, errorHandler
│   │   ├── services/     # notification.service, history.service
│   │   ├── utils/         # jwt, generateComplaintCode
│   │   └── config/        # db.js (Prisma client)
│   └── uploads/           # local image storage (complaints/, resolutions/)
├── database/
│   └── schema/schema.sql  # reference copy of the schema (Prisma is source of truth)
└── frontend/               # to be added next stage
```

## Setup

Prerequisites: **Node.js 18+**, **PostgreSQL 14+** running locally.

```bash
cd backend
npm install

cp .env.example .env
# edit .env: set DATABASE_URL to your local Postgres connection string, and JWT_SECRET

createdb campusfix                 # or use your preferred Postgres GUI
npx prisma migrate dev --name init # creates all tables from prisma/schema.prisma
npm run seed                       # populates demo users, categories, locations, 12 sample complaints

npm run dev                        # starts the API on http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`

## Demo logins (seeded, password for all: `Demo@123`)

| Role    | Email                     |
|---------|----------------------------|
| Admin   | admin@campusfix.edu        |
| Staff   | staff@campusfix.edu        |
| Student | student1@campusfix.edu     |
| Student | student2@campusfix.edu     |
| Student | student3@campusfix.edu     |

## API reference

All routes except `/auth/register` and `/auth/login` require `Authorization: Bearer <token>`.

**Auth**
- `POST /api/auth/register` — student self-registration only
- `POST /api/auth/login`
- `GET /api/auth/me`

**Complaints**
- `GET /api/complaints` — role-scoped (student sees own, staff sees assigned, admin sees all). Query params: `status, category, priority, location, search, dateFrom, dateTo`
- `POST /api/complaints` — student only, `multipart/form-data` with optional `image` field
- `GET /api/complaints/:id` — full details incl. history, resolution
- `PUT /api/complaints/:id` — admin, edit core fields
- `DELETE /api/complaints/:id` — admin
- `PUT /api/complaints/:id/status` — admin or the assigned staff member, body `{ status, note }`
- `PUT /api/complaints/:id/assign` — admin, body `{ staffId }`
- `POST /api/complaints/:id/resolve` — assigned staff, `multipart/form-data` with `notes` + optional `image`

**Categories / Locations**
- `GET /api/categories`, `GET /api/locations` — any authenticated user
- `POST /PUT /DELETE` on both — admin only

**Notifications**
- `GET /api/notifications` — current user's notifications
- `PUT /api/notifications/:id/read`

**Dashboard**
- `GET /api/dashboard/stats` — role-scoped totals, by-status/category/location breakdowns, critical count

**Users**
- `GET /api/users?role=staff` — admin only, used to populate the assignment dropdown

## Demo flow (matches the intended viva walkthrough)

1. Student logs in → reports a broken classroom fan with a photo → gets complaint ID `CF-2026-00xx`
2. Admin logs in → reviews the complaint → assigns it to Maintenance Staff (status → `Assigned`)
3. Staff logs in → sees it in their assigned list → sets status to `In Progress`
4. Staff adds resolution notes (+ optional photo) → marks `Resolved`
5. Student sees a notification and the full status timeline on the complaint details page

Every status change is written to `complaint_history`, which is what powers the timeline.

## Security notes

- Passwords hashed with bcrypt (10 salt rounds), never returned in API responses
- JWT-based auth; role embedded in the token and enforced per-route via `authorize()`
- Public registration is locked to the `student` role — staff/admin accounts are seeded only
- Uploaded files are type-checked (jpg/jpeg/png/webp) and size-limited (5MB default)
