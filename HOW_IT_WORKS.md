# SECURETASKHUB — System Architecture & Operational Overview

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                       SECURETASKHUB COMMAND CENTER                      │
 │                ENCRYPTED NODE 04 · PROTOCOL TELEMETRY                   │
 └─────────────────────────────────────────────────────────────────────────┘
```

## 1. Executive Summary
**SecureTaskHub** is a high-security, containerized, Role-Based Access Control (RBAC) task management platform and protocol command center. Designed for sensitive enterprise environments, Security Operations Centers (SOCs), and DevSecOps teams, the platform merges military-grade zero-trust authentication workflows with a state-of-the-art, high-contrast **Stitch Professional UI**.

---

## 2. Why is this Project Needed? (The Problem & Solution)

### The Problem
Traditional project management and Kanban tools (e.g., Jira, Trello, Asana) are designed for broad commercial collaboration rather than zero-trust security. They present significant risks for high-security environments:
1. **Third-Party Data Exposure**: Storing sensitive vulnerability reports, zero-day mitigation steps, or cryptographic key rotation schedules on external SaaS servers creates a severe target for corporate espionage and data breaches.
2. **Weak Access Control**: Lack of strict, clearance-level isolation allows horizontal privilege escalation, where lower-level employees or compromised accounts can view, alter, or delete critical infrastructure tasks.
3. **Lack of Immutable Auditing**: Standard tools fail to provide tamper-proof, real-time activity logging for forensic compliance.
4. **Session Vulnerabilities**: Token storage in `localStorage` makes standard web applications highly vulnerable to Cross-Site Scripting (XSS) token theft.

### The Solution: SecureTaskHub
SecureTaskHub isolates operations entirely within a self-hosted, Docker-containerized infrastructure while enforcing strict clearance boundaries:
- **Zero-Trust Session Architecture**: Employs dual JWT tokens (short-lived 15-minute Access Tokens and 7-day Refresh Tokens) stored exclusively in encrypted, `httpOnly`, `sameSite: strict` browser cookies.
- **Granular RBAC**: Enforces three strict clearance tiers—**Level 1 (Viewer / USER)**, **Level 3 (Editor / MANAGER)**, and **Level 5 (Admin / ADMIN)**—with automatic backend verification on every API request.
- **Immutable Audit Trail**: Every task creation, status mutation, and clearance change is permanently logged to an append-only relational audit table.
- **Self-Contained Deployment**: Full data sovereignty powered by an isolated PostgreSQL database and Express/Prisma microservice.

---

## 3. How It Works (System Architecture)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React/Vite)                         │
│   AppShell · Kanban Matrix (@hello-pangea/dnd) · Live Protocol Feed     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (HTTP-Only Cookies / Socket.IO)
┌────────────────────────────────────▼────────────────────────────────────┐
│                        BACKEND API (Express/Node)                       │
│    RBAC Middleware · JWT Verifier · Socket Emitter · Prisma Client      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (Prisma ORM / TCP 5432)
┌────────────────────────────────────▼────────────────────────────────────┐
│                       DATABASE (PostgreSQL 16)                          │
│         Users Table · Tasks Table · Immutable ActivityLog Table         │
└─────────────────────────────────────────────────────────────────────────┘
```

### A. Frontend Layer (Client)
- **Framework**: React 18, Vite, TypeScript, Vanilla CSS (`index.css`).
- **Stitch Design System**: Implements a dark-mode cyberpunk aesthetic (`#10141a` base, `#25c2a0` teal primary, `#FF5252` critical alert accents) with custom switches, asymmetric grid layouts, and biometric dropzones.
- **Interactive Kanban (`@hello-pangea/dnd`)**: Provides fluid drag-and-drop task progression between `Pending`, `In Progress`, and `Done` states.
- **Live Telemetry & Activity Feed**: Simulates real-time broadcast pings and displays ongoing node synchronizations.

### B. Backend API Layer (Server)
- **Framework**: Express.js & TypeScript.
- **Authentication Engine**: Uses `bcrypt` for secure 10-round password hashing. Manages secure token issuing and automated cookie refresh cycles (`/api/auth/refresh`).
- **RBAC Middleware**: Intercepts requests to verify user identity (`requireAuth`) and clearance level (`requireRole`).
- **Bootstrapping Automation**: Automatically assigns the **Level 5 (ADMIN)** role to the very first user registered in the database, allowing immediate access control management. Subsequent registrations receive the **Level 1 (USER)** role.

### C. Real-Time Telemetry Layer (WebSocket)
- **Socket.IO Integration**: Establishes a persistent, authenticated WebSocket connection per operator ID.
- **Event Broadcasts**: Pushes immediate, high-contrast toast alerts across the matrix when tasks are assigned (`taskAssigned`), statuses mutate (`taskUpdated`), or deadlines approach (`deadlineApproaching`).

### D. Persistence Layer (Database)
- **Engine**: PostgreSQL 16 managed via Prisma ORM.
- **Data Models**:
  - `User`: Operator credentials, role definitions (`USER`, `MANAGER`, `ADMIN`), and biometric metadata.
  - `Task`: Protocol title, description, priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), status, and assignee linkages.
  - `ActivityLog`: Forensic tracking table recording exact timestamps, operator IDs, and action descriptions.

---

## 4. Key Applications &amp; Industry Use Cases

### 1. Security Operations Centers (SOC) &amp; Incident Response
SOC teams can track live zero-day vulnerabilities, firewall patching schedules, and threat hunting protocols. Critical tasks trigger priority escalation alerts, ensuring immediate analyst visibility.

### 2. Cryptographic Key &amp; Infrastructure Management
DevSecOps teams can manage the lifecycle of RSA access tokens, SSL certificate renewals, and API key rotations across isolated server nodes without risking exposure on public project boards.

### 3. Defense, Aerospace &amp; Classified Telemetry
Organizations requiring strict clearance-level enforcement can isolate task matrices by sector. Level 1 operators can initiate and update assigned tasks, while Level 5 commanders maintain absolute oversight of the access roster.

### 4. Regulatory &amp; Forensic Compliance Auditing
For industries governed by HIPAA, SOC2, or ISO 27001, the platform's immutable activity log provides auditors with verifiable proof of exactly who initiated, modified, or completed every sensitive procedure.

---

## 5. Operational Quickstart Guide

### Running the Command Center
The entire suite is fully containerized and orchestrated via Docker Compose:

```bash
# Start all microservices in the background
docker-compose up -d --build

# View real-time backend telemetry logs
docker-compose logs -f server
```

### Accessing Node Endpoints
- **Command Center UI**: [http://localhost:5173](http://localhost:5173)
- **API Telemetry Gateway**: [http://localhost:5000](http://localhost:5000)
- **PostgreSQL Database**: `localhost:5432`

### First-Time Setup
1. Navigate to [http://localhost:5173/register](http://localhost:5173/register).
2. Register your primary commander credentials (e.g., `commander@securenode.local`).
3. As the first registered operator, your account is automatically provisioned with **Level 5 (ADMIN)** clearance.
4. Log in to access the **Command Center**, initiate tasks in the **Task Matrix**, and manage incoming operators in the **Access Control** tab.
