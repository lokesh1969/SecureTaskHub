# SECURETASKHUB — Protocol Command Center &amp; Encrypted Task Matrix

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                       SECURETASKHUB COMMAND CENTER                      │
 │                ENCRYPTED NODE 04 · PROTOCOL TELEMETRY                   │
 └─────────────────────────────────────────────────────────────────────────┘
```

**SecureTaskHub** is a production-grade, security-first task management platform and telemetry command center. Designed for high-security enterprise environments, Security Operations Centers (SOCs), and DevSecOps teams, the platform merges military-grade zero-trust authentication workflows with the state-of-the-art, high-contrast **Stitch Professional Design System**.

---

## 📸 Platform Interface & Telemetry Output

*(Replace these placeholder image paths with actual screenshots of your running application before pushing to GitHub. Save your screenshots in a `docs/` or `assets/` folder in your repository.)*

<div align="center">
  <img src="docs\Screenshot 2026-05-21 123012.png" alt="SecureTaskHub Command Center Dashboard" width="800"/>
  <p><i>Command Center Dashboard — Interactive Kanban Matrix with live websocket updates.</i></p>
</div>

<br/>

<div align="center">
  <img src="docs\image.png" alt="Role-Based Access Control Roster" width="800"/>
  <p><i>Access Control Matrix — Level 5 Admin view for mutating clearance levels.</i></p>
</div>

---

## 🌟 Key Features &amp; Architectural Highlights

### 🛡️ Zero-Trust Session Architecture
- **Dual JWT Tokens**: Implements short-lived Access Tokens (15m) and persistent Refresh Tokens (7d).
- **Hardened Cookie Storage**: Tokens are stored exclusively in encrypted, `httpOnly`, `sameSite: strict` browser cookies, rendering the application completely immune to XSS token theft and horizontal session hijacking.

### 👥 Granular Role-Based Access Control (RBAC)
- **Three-Tier Clearance Matrix**: Enforces strict operational boundaries across **Level 1 (USER)**, **Level 3 (MANAGER)**, and **Level 5 (ADMIN)** tiers.
- **Queue Isolation**: Level 1 Operators only receive telemetry for tasks specifically assigned to their ID.
- **Automated Bootstrapping**: The very first user registered in the database is automatically provisioned with **Level 5 (ADMIN)** clearance, ensuring immediate administrative control over the access roster.

### ⚡ Real-Time WebSocket Telemetry
- **Socket.IO Broadcast Engine**: Pushes instant, high-contrast toast notifications across the matrix when protocols are assigned (`taskAssigned`), statuses mutate (`taskUpdated`), or deadlines approach (`deadlineApproaching`).

### 🎨 Stitch Professional UI / UX
- **Cyberpunk Dark-Mode Aesthetic**: Styled with premium design tokens (`#10141a` deep surface, `#25c2a0` teal primary, `#FF5252` critical alert accents).
- **Interactive Kanban Matrix**: Fluid drag-and-drop task progression powered by `@hello-pangea/dnd`.
- **Live Telemetry Feeds**: Interactive protocol broadcast simulation, custom alert matrix toggle switches, and biometric identity dropzones.

---

## 🔐 Role-Based Demo Credentials

Explore the platform's multi-tiered clearance architecture using the pre-seeded demo accounts below:

| Clearance Level | Email | Password | Role | Capabilities |
| :--- | :--- | :--- | :---: | :--- |
| **Level 5 (Admin)** | `admin@securetaskhub.com` | `secure123` | `ADMIN` | Full access to Access Control roster (`/admin`), clearance mutation, simulate access revocation, and global matrix oversight. |
| **Level 3 (Manager)**| `manager@securetaskhub.com`| `secure123` | `MANAGER`| Full oversight to view and update task protocols across the entire matrix. Restricted from User Access Control roster. |
| **Level 1 (Operator)**| `operator@securetaskhub.com`| `secure123` | `USER` | Isolated queue view. Can only view and update tasks specifically assigned to `operator@securetaskhub.com` or unassigned tasks. |

---

## 🚀 Quickstart &amp; Local Orchestration

The entire application suite is fully containerized and orchestrated via Docker Compose.

### 1. Clone &amp; Start Microservices
```bash
# Clone the repository
git clone https://github.com/yourusername/SecureTaskHub.git
cd SecureTaskHub

# Start all microservices in the background
docker-compose up -d --build
```

### 2. Access Node Endpoints
- **Command Center UI (Frontend)**: [http://localhost:5173](http://localhost:5173)
- **API Telemetry Gateway (Backend)**: [http://localhost:5000](http://localhost:5000)
- **PostgreSQL Database**: `localhost:5432`

---

## 📂 Monorepo Architecture

```
SecureTaskHub/
├── client/                  # React 18, Vite, TypeScript, Stitch UI
│   ├── src/
│   │   ├── context/         # AuthContext & WebSocket Provider
│   │   ├── pages/           # Command Center, Task Matrix, Access Control, Settings
│   │   └── index.css        # Global Stitch Design Tokens & Custom Properties
├── server/                  # Express.js, TypeScript, Socket.io
│   ├── prisma/              # Schema definitions & PostgreSQL migrations
│   ├── src/
│   │   ├── controllers/     # Auth, Task, and User business logic
│   │   ├── middleware/      # JWT verification (`requireAuth`) & RBAC (`requireRole`)
│   │   └── utils/           # Cryptographic token generators & validators
├── docker-compose.yml       # Multi-container orchestration config
├── HOW_IT_WORKS.md          # In-depth architectural deep-dive & industry use cases
└── README.md                # Project overview & quickstart guide
```

---

## 🧪 Testing &amp; Verification

### Backend Unit &amp; Integration Tests
Powered by Jest and Supertest. To execute the test suite locally:
```bash
cd server
npm test
```

### Frontend End-to-End (E2E) Tests
Powered by Cypress. To run E2E verification:
```bash
cd client
npx cypress run
```

---

## 🛡️ CI/CD Security Pipeline
The repository includes a robust GitHub Actions workflow (`.github/workflows/pipeline.yml`) enforcing:
1. **Code Linting**: Static analysis of TypeScript/React components.
2. **Automated Testing**: Execution of backend Jest test suites.
3. **Vulnerability Audit**: Scanning for high-severity NPM dependency CVEs.
4. **CodeQL Analysis**: Static Application Security Testing (SAST).
5. **Docker Hub Deployment**: Automated container builds and registry pushes on `main` branch merges.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
