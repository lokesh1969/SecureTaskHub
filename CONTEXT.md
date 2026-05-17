# SecureTaskHub Context

## Current Project Status
- **Done**: 
  - Phase 1 — Project Foundation
  - Phase 2 — Authentication
  - Phase 3 — RBAC and User Management
  - Phase 4 — Task Board
  - Phase 5 — Real-Time Notifications
  - Phase 6 — Security Hardening
  - Phase 7 — Testing
  - Phase 8 — CI/CD Pipeline
- **In Progress**: None
- **Pending**: None

## Folder Structure
```text
/ (Project Root)
├── CONTEXT.md
├── README.md
├── docker-compose.yml
├── .env.example
├── client/
│   ├── cypress.config.ts
│   ├── cypress/
│   │   └── e2e/
│   │       └── core_journey.cy.ts
│   ├── Dockerfile.dev
│   ├── package.json
│   ├── src/
│   │   ├── App.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── TaskBoard.tsx
│   │   ├── utils/
│   │   │   └── axios.ts
│   │   └── index.css
│   └── vite.config.ts
└── server/
    ├── jest.config.js
    ├── src/
    │   ├── __tests__/
    │   │   └── auth.test.ts
    ├── Dockerfile.dev
    ├── package.json
    ├── prisma/
    │   └── schema.prisma
    ├── src/
    │   ├── controllers/
    │   │   ├── auth.controller.ts
    │   │   ├── task.controller.ts
    │   │   └── user.controller.ts
    │   ├── middleware/
    │   │   └── auth.ts
    │   ├── routes/
    │   │   ├── auth.routes.ts
    │   │   ├── task.routes.ts
    │   │   └── user.routes.ts
    │   ├── utils/
    │   │   └── jwt.ts
    │   ├── db/
    │   │   └── prisma.ts
    │   └── server.ts
    └── tsconfig.json
```

## Technical Decisions
- **Testing**: Jest for backend API integration tests with Prisma mocked. Cypress for frontend end-to-end journey tests.
- **Security Hardening**: Prisma extension automatically masks password hashes in all queries. Helmet handles CSP and other HTTP security headers. `express-rate-limit` prevents brute-force login and general API abuse.
- **Authentication**: JWT HttpOnly cookies, refresh tokens, express-rate-limit.
- **RBAC**: Added `requireRole` middleware. The `AdminDashboard` allows changing user roles via the API.
- **Task Board**: Used `@hello-pangea/dnd` for Kanban drag-and-drop. Activity logs are appended to the DB on every task mutation.
- **Real-Time Notifications**: Socket.IO integrated with Express. `taskAssigned` and `deadlineApproaching` events trigger `react-toastify` notifications.
- **Stack**: React + TypeScript (Vite), Node.js + Express, PostgreSQL + Prisma.

## Environment Variables
Defined in `.env.example`:
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `DATABASE_URL` (for Prisma)
- `PORT`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `VITE_API_URL`

## How to Run Locally
1. Copy `.env.example` to `.env`
2. Run `docker-compose up --build`
3. Frontend will be on `http://localhost:5173`, Backend on `http://localhost:5000`

## Next Step
- Project is functionally complete! You can run it locally with Docker Compose or examine the test coverage and CI/CD pipelines.

