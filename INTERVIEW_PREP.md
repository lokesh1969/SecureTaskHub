# SECURETASKHUB — Masterclass Interview Preparation &amp; Script

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                     SECURETASKHUB INTERVIEW BRIEFING                    │
 │         ELEVATOR PITCH · ARCHITECTURAL WORKFLOWS · Q&A SESSIONS         │
 └─────────────────────────────────────────────────────────────────────────┘
```

This document is specifically structured to help you articulate the technical depth, security architecture, and design decisions of **SecureTaskHub** during engineering interviews. It provides a structured elevator pitch, deep-dive workflow explanations, and senior-level answers to expected interviewer questions, **complete with exact file paths and line numbers** for every core feature.

---

## 🎙️ 1. The 3-Minute Elevator Pitch (The Script)

**When the interviewer asks:** *"Tell me about a recent project you built"* or *"Walk me through SecureTaskHub."*

> **"In my recent work, I architected and developed SecureTaskHub, an enterprise-grade, zero-trust task management platform and telemetry command center designed for high-security environments like Security Operations Centers (SOCs) and DevSecOps teams.**
>
> **The Problem I set out to solve was twofold:** First, commercial project management tools like Jira or Trello force enterprises to store highly sensitive operational data—such as zero-day vulnerability mitigation steps or API key rotation schedules—on third-party SaaS servers, creating a major target for corporate espionage. Second, many modern web apps suffer from weak session architecture, storing JSON Web Tokens (JWTs) in `localStorage`, which leaves them highly vulnerable to Cross-Site Scripting (XSS) token theft and privilege escalation.
>
> **To solve this, I built a self-hosted, Docker-containerized monorepo using React 18, TypeScript, Express, Prisma ORM, and PostgreSQL.** 
> 
> From a security perspective, I implemented a strict dual-token JWT architecture where short-lived Access Tokens and persistent Refresh Tokens are stored exclusively in encrypted, `httpOnly`, `sameSite: strict` cookies, completely neutralizing XSS token harvesting. I also built a robust 3-tier Role-Based Access Control (RBAC) middleware that enforces absolute isolation between Level 1 Operators, Level 3 Department Managers, and Level 5 Administrators. 
>
> For the frontend, I integrated the premium **Stitch Professional Design System**, creating a high-contrast cyberpunk command center aesthetic featuring fluid drag-and-drop Kanban boards (`@hello-pangea/dnd`), live WebSocket telemetry feeds via Socket.IO, and interactive biometric identity simulators.
>
> **The result is a production-ready, highly secure platform** where operators have isolated queue visibility, supervisors can seamlessly manage departmental workflows, and administrators maintain absolute oversight over the access roster and immutable audit logs."

---

## ⚙️ 2. Core Architectural Workflows (How It Works)

Use these explanations when the interviewer asks how specific features function under the hood.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     WORKFLOW 1: SECURE AUTHENTICATION                   │
│   Client Login ──► Express/bcrypt Hash ──► JWT Generation ──► HttpOnly  │
└─────────────────────────────────────────────────────────────────────────┘
```
### Workflow 1: Zero-Trust Authentication &amp; Cookie Issuance
1. **Credentials Verification** (`server/src/controllers/auth.controller.ts:L35-L38`): When a user logs in, Express searches PostgreSQL via Prisma. It uses `bcrypt.compare` to verify the plaintext password against the salted 10-round hash stored in the database.
2. **Dual JWT Issuance** (`server/src/utils/jwt.ts:L6-L10`): The backend generates two tokens using `jsonwebtoken`: a short-lived **Access Token (15m)** and a long-lived **Refresh Token (7d)**. Both tokens encode the user's `userId` and clearance `role`.
3. **Hardened Cookie Attachment** (`server/src/controllers/auth.controller.ts:L42-L55`): Express attaches these tokens to the response headers using `res.cookie()`, explicitly setting `httpOnly: true` (blocking JavaScript access), `sameSite: 'strict'` (preventing CSRF), and `secure: true` (enforcing HTTPS transmission).
4. **Automated Silent Refresh** (`client/src/utils/axios.ts:L10-L30`): When the 15m Access Token expires, the frontend's Axios interceptor catches the `401 Unauthorized` error, automatically pings `/api/auth/refresh` to spin up a new Access Token via the Refresh cookie, and seamlessly retries the failed API call without disrupting the user.
5. **Automated Bootstrapping** (`server/src/controllers/auth.controller.ts:L16-L21`): When a new user registers, the backend checks `prisma.user.count()`. If the count is 0, the first registered user is automatically assigned the `ADMIN` role.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      WORKFLOW 2: RBAC QUEUE ISOLATION                   │
│   HTTP GET /tasks ──► requireAuth / requireRole ──► Prisma OR Filter    │
└─────────────────────────────────────────────────────────────────────────┘
```
### Workflow 2: Granular RBAC &amp; Task Matrix Isolation
1. **Middleware Interception** (`server/src/middleware/auth.ts:L4-L25`): Every incoming Express request passes through `requireAuth` (which decodes the JWT) and `requireRole` (which verifies clearance).
2. **Dynamic Database Filtering** (`server/src/controllers/task.controller.ts:L9-L18`): In `getTasks`, the backend inspects `user.role`. If the user is a Level 1 `USER`, Prisma executes a filtered query (`WHERE assigneeId = user.userId OR assigneeId IS NULL`), ensuring operators only receive telemetry for their specific department. If the user is an `ADMIN`, Prisma fetches the entire global matrix.
3. **Mutation Defense** (`server/src/controllers/task.controller.ts:L64-L66`): If a Level 1 Operator attempts to update a task assigned to another department, the controller intercepts the request, verifies ownership (`task.assigneeId !== user.userId`), and blocks the attempt with a `403 Forbidden` error.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW 3: REAL-TIME TELEMETRY                      │
│   Express Task Mutation ──► Socket.IO Emitter ──► Client Toast Alert    │
└─────────────────────────────────────────────────────────────────────────┘
```
### Workflow 3: Real-Time WebSocket Telemetry
1. **Persistent Handshake** (`client/src/App.tsx:L19-L32`): Upon login, the React client initiates a WebSocket connection to the Express server via `SocketManager`. The server assigns the socket to a private room matching the operator's `userId` (`socket.emit('join', user.id)`).
2. **Targeted Broadcasts** (`server/src/controllers/task.controller.ts:L45-L48` &amp; `L77-L80`): When a Manager creates a task or mutates a status, the Express controller executes `io.to(assigneeId).emit('taskAssigned', { ... })` or `emit('taskUpdated')`.
3. **Instant UI Reaction** (`client/src/App.tsx:L25-L27`): The React `SocketManager` listener intercepts the TCP packet and instantly triggers a high-contrast toast notification on the Operator's screen.
4. **Kanban Virtual DOM Batching** (`client/src/pages/TaskBoard.tsx:L46-L61`): Powered by `@hello-pangea/dnd`, task dragging triggers `onDragEnd`, instantly updating local React state for a 60 FPS optimistic UI update while firing the PUT request in the background.

---

## ❓ 3. Expected Interviewer Questions &amp; Senior Answers

### Q1: Why did you choose `httpOnly` cookies over `localStorage` for storing JWTs? Where is this configured in your code?
**Interviewer Intent:** *Testing your understanding of web security, XSS, and CSRF vulnerabilities.*

> **Senior Answer:** "`localStorage` is directly accessible via JavaScript (`window.localStorage`). If our application suffers from even a single Cross-Site Scripting (XSS) vulnerability—such as an un-sanitized user input or a compromised NPM dependency—an attacker can execute a script to harvest all JWTs in `localStorage` and take over user accounts.
>
> By storing JWTs in `httpOnly` cookies (configured in `server/src/controllers/auth.controller.ts:L42-L55`), the browser handles token transmission automatically on every network request, and the cookies are completely invisible to client-side JavaScript. To protect against Cross-Site Request Forgery (CSRF), I configured the cookies with `sameSite: 'strict'`, ensuring tokens are only sent when requests originate directly from our exact domain."

---

### Q2: How does your Role-Based Access Control (RBAC) implementation prevent horizontal and vertical privilege escalation? Where are the checks located?
**Interviewer Intent:** *Testing backend authorization logic and zero-trust API design.*

> **Senior Answer:** "To prevent vertical privilege escalation (a standard user gaining admin powers), I built a custom `requireRole` middleware in Express (`server/src/middleware/auth.ts:L17-L25`). Even if a Level 1 Operator manipulates the React UI to reveal the Admin Dashboard and sends a `PUT` request to `/api/users/role`, the Express route verifies the JWT role against the required clearance level before touching the database, instantly blocking the request.
> 
> To prevent horizontal privilege escalation (an operator modifying another operator's tasks), the task controllers execute an explicit ownership check (`server/src/controllers/task.controller.ts:L64-L66`). If an operator tries to mutate a task belonging to another department, the backend rejects it with a `403 Forbidden` error. We never trust client-side parameters; authorization is always re-verified at the database level."

---

### Q3: Why did you choose Prisma ORM and PostgreSQL over a NoSQL database like MongoDB? Where is your schema defined?
**Interviewer Intent:** *Testing database architecture and data modeling decisions.*

> **Senior Answer:** "Task management, access control rosters, and forensic audit logs are inherently relational. We need strict ACID compliance and foreign key constraints between `User`, `Task`, and `ActivityLog` tables (defined in `server/prisma/schema.prisma:L17-L57`) to ensure data integrity and prevent orphaned records (such as tasks belonging to deleted operators).
>
> Furthermore, Prisma ORM provides an automated, type-safe database client (`server/src/db/prisma.ts`) that integrates perfectly with TypeScript. This allowed me to catch database querying errors at compile time rather than runtime, drastically accelerating development while maintaining absolute schema rigidity."

---

### Q4: How does the real-time notification system work under the hood? Why not use Server-Sent Events (SSE) or HTTP Polling?
**Interviewer Intent:** *Testing your knowledge of networking protocols and real-time systems.*

> **Senior Answer:** "HTTP Polling is incredibly inefficient; having 500 operators ping the server every 3 seconds to check for new tasks would flood our Express server with redundant network traffic and exhaust database connection pools.
>
> While Server-Sent Events (SSE) provide great one-way communication, I chose **Socket.IO (WebSockets)** (initialized in `server/src/server.ts:L24-L35` and managed on the client in `client/src/App.tsx:L19-L32`) because a Protocol Command Center requires robust, bi-directional full-duplex communication. WebSockets allow the server to push instant `taskAssigned` pings to specific operator rooms (`io.to(assigneeId)`), while also allowing the client to instantly emit live heartbeat telemetry back to the server over a single, persistent TCP connection."

---

### Q5: How did you handle state management and UI performance on the frontend?
**Interviewer Intent:** *Testing React architecture, rendering optimization, and component design.*

> **Senior Answer:** "I took a modular approach to state management. For global user authentication and WebSocket instances—which change very infrequently—I utilized React's native Context API (`client/src/context/AuthContext.tsx`), avoiding the boilerplate of heavy external libraries like Redux.
>
> For the Kanban board (`client/src/pages/TaskBoard.tsx`), performance is critical during drag-and-drop operations. I implemented `@hello-pangea/dnd` because it utilizes React memoization and virtual DOM batching under the hood. When an operator drags a task card across columns (`onDragEnd` at `L46-L61`), only the affected source and destination droppable containers re-render, ensuring buttery-smooth 60 FPS animations even with hundreds of active tasks."

---

### Q6: What was the most challenging technical hurdle you faced in this project, and how did you overcome it? Where is the solution in your codebase?
**Interviewer Intent:** *Testing problem-solving, debugging skills, and architectural resilience.*

> **Senior Answer:** "The most complex technical challenge was orchestrating seamless silent JWT refresh token rotation alongside active WebSocket connections in a containerized Docker environment.
>
> Initially, when the 15-minute Access Token expired, ongoing REST API calls would fail with `401 Unauthorized`, and the Socket connection would drop, causing a jarring user experience. 
>
> I solved this by building a robust Axios response interceptor on the React frontend (`client/src/utils/axios.ts:L10-L30`). When the interceptor detects a `401` error, it pauses all incoming API requests in a queue, calls the `/api/auth/refresh` endpoint (`server/src/controllers/auth.controller.ts:L62-L91`) to silently rotate the `httpOnly` cookies, updates the Axios header state, and then flushes the queue to retry the failed requests. Simultaneously, it emits a re-authentication ping over the WebSocket. The entire rotation happens completely in the background without the operator ever realizing their session was refreshed."
