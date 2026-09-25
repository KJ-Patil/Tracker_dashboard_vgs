# VGS Real-Time Client Project Hub & Activity Stream

### Velozity Global Solutions — Technical Hiring Assessment

A full-stack, real-time client project management dashboard engineered for digital agencies to monitor project milestones, task progress, team activity feeds, and scheduled automations.

---

## 🔗 Live Demo & Repository

- **Frontend Live App**: [Deployed on Vercel](https://vgs-dashboard-client.vercel.app) _(Replace with your deployed Vercel URL)_
- **GitHub Repository**: [KJ-Patil/vgs_dashboard](https://github.com/KJ-Patil/vgs_dashboard)

---

## 🔑 Seeded Demo Accounts (7 Users Total)

All accounts share the default password: `password123`.

| Role                | Name           | Email                | Password      | Access Level                                                     |
| :------------------ | :------------- | :------------------- | :------------ | :--------------------------------------------------------------- |
| **Admin**           | Sarah Connor   | `admin@vgs.com`      | `password123` | Global access: all projects, tasks, seed metrics & live presence |
| **Project Manager** | Alex Morgan    | `alex.pm@vgs.com`    | `password123` | PM access: Apex Banking & Logistics Tracker projects             |
| **Project Manager** | David Chen     | `david.pm@vgs.com`   | `password123` | PM access: HealthCare Portal Redesign project                    |
| **Developer**       | Ravi Patel     | `ravi.dev@vgs.com`   | `password123` | Dev access: Only tasks assigned to Ravi, status updates          |
| **Developer**       | Elena Rostova  | `elena.dev@vgs.com`  | `password123` | Dev access: Only tasks assigned to Elena                         |
| **Developer**       | Marcus Johnson | `marcus.dev@vgs.com` | `password123` | Dev access: Only tasks assigned to Marcus                        |
| **Developer**       | Priya Sharma   | `priya.dev@vgs.com`  | `password123` | Dev access: Only tasks assigned to Priya                         |

---

## 🚀 Tech Stack & Key Technologies

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Axios, Socket.io Client, date-fns.
- **Backend**: Node.js, Express, TypeScript, Socket.io, Prisma ORM, JSON Web Tokens (JWT), bcrypt, cookie-parser, node-cron.
- **Database**: PostgreSQL (relational schema, foreign keys, cascade deletes, composite indexes).
- **Scheduled Jobs**: node-cron (recurring background overdue task detection).
- **Real-Time Protocol**: WebSockets via Socket.io (multiplexed rooms, JWT handshake auth, presence tracking, missed-event catchup).

---

## ⚡ Quick Start & Local Setup

### Option 1: Docker (Preferred for Database)

```bash
# 1. Start PostgreSQL container
docker compose up -d

# 2. Server setup
cd server
npm install
npx prisma db push
npm run seed
npm run dev

# 3. Client setup (in a new terminal)
cd ../client
npm install
npm run dev
```

### Option 2: Standard Local Setup (Existing PostgreSQL)

1. **Configure Environment Variables**:
   - In `server/.env`:
     ```env
     DATABASE_URL="postgresql://postgres:password@localhost:5432/vgs_dashboard"
     PORT=5000
     JWT_SECRET="vgs_assessment_jwt_access_secret_super_secure_key_123"
     JWT_REFRESH_SECRET="vgs_assessment_jwt_refresh_secret_super_secure_key_456"
     CLIENT_URL="http://localhost:5173"
     ```
   - In `client/.env`:
     ```env
     VITE_API_URL="http://localhost:5000/api"
     VITE_WS_URL="http://localhost:5000"
     ```

2. **Run Server & Database Seed**:

   ```bash
   cd server
   npm install
   npx prisma db push
   npm run seed
   npm run dev
   ```

3. **Run Client Application**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

---

## 📊 Database Schema & Indexing Rationale

### Prisma Relational Schema Overview

```
[ User ] 1 ─── n [ Task (developerId) ]
[ User ] 1 ─── n [ Project (managerId) ]
[ Project ] 1 ─── n [ Task (projectId) ]
[ Task ] 1 ─── n [ ActivityLog ]
[ Task ] 1 ─── n [ Notification ]
```

### Indexing Decisions & Rationale

1. **`Task(projectId)` & `Task(developerId)`**: Foreign key lookups happen on every project page and developer dashboard view. Indexing these foreign keys ensures O(log N) indexed joins rather than full table scans.
2. **`Task(status)` & `Task(priority)`**: The UI allows instant filtering across statuses (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`) and priorities (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`). Indexes support high-cardinality multi-attribute queries.
3. **`Task(dueDate)` & `Task(isOverdue)`**: The background cron job scans tasks past their due date every minute (`WHERE dueDate < NOW() AND status != 'DONE' AND isOverdue = false`). Composite b-tree indexing on `dueDate` ensures sub-millisecond scheduled updates even with tens of thousands of tasks.
4. **`Notification(userId, isRead)`**: In-app badge count queries execute `SELECT COUNT(*) WHERE userId = $1 AND isRead = false` frequently. The composite index eliminates index-scan overhead.
5. **`ActivityLog(createdAt)` & `ActivityLog(taskId)`**: Activity logs are queried with `ORDER BY createdAt DESC LIMIT 20` for real-time catchup. Indexing `createdAt` satisfies the order without requiring expensive in-memory sort buffers.

---

## 🏗️ Architectural Decisions

### 1. WebSocket Library: Socket.io vs Native WebSockets

- **Decision**: Selected **Socket.io** over raw native WebSockets.
- **Justification**:
  - **Room Multiplexing**: Role-based access control requires granular event partitioning. Socket.io's native `socket.join()` allows isolated rooms for `admin`, individual PMs (`managerId`), assigned developers (`developerId`), and specific projects (`project:${id}`).
  - **Built-in Handshake Authentication**: JWT validation happens directly during the initial connection handshake (`socket.handshake.auth.token`). Invalid or expired tokens are rejected before socket allocation.
  - **Automatic Reconnection & Missed Catchup**: Socket.io handles transient disconnects and fires the `catchup` event, restoring the last 20 events from PostgreSQL seamlessly.
  - **Presence Tracking**: Connection and disconnection events accurately track live active users across the cluster without needing separate heartbeat polling scripts.

### 2. Job Queue: node-cron vs Bull Queue

- **Decision**: Implemented **node-cron** for the overdue task engine.
- **Justification**:
  - **Self-Contained Simplicity**: node-cron operates in-process with zero external infrastructure overhead (no Redis dependency required for simple timed sweeps).
  - **Idempotent Batch Query**: The cron runs a single atomic SQL update (`prisma.task.updateMany`) flagging overdue tasks whose due date has elapsed.
  - **Bull Upgrade Path**: For multi-server horizontal scaling with distributed locks, Bull/BullMQ with Redis would be used to prevent duplicate worker executions across instances.

### 3. Token Storage & Authentication Architecture

- **Decision**: Dual-token architecture using **15-minute Access Token in memory** and **7-day Refresh Token in an HttpOnly, SameSite cookie**.
- **Justification**:
  - **XSS Immunity**: Storing refresh tokens in `localStorage` makes them vulnerable to malicious client scripts. HttpOnly cookies cannot be accessed via JavaScript `document.cookie`.
  - **CSRF Defense**: Cookies are restricted with `SameSite=lax` (or `SameSite=strict` in production), preventing cross-origin forgery attacks.
  - **Silent Session Rehydration**: When refreshing the page, the client calls `POST /api/auth/refresh`. If the HttpOnly cookie is valid, a new access token is returned in memory without requiring the user to re-enter credentials.

### 4. API-Level Role-Based Access Control (RBAC)

- **Strict Backend Enforcement**: Hiding buttons in the frontend is only for user experience. Every API endpoint validates credentials through `authenticate` and `authorize('ADMIN', 'PROJECT_MANAGER')` middleware.
- **Tenant & Entity Scoping**:
  - Developers querying `GET /api/tasks` or updating `PATCH /api/tasks/:id/status` are restricted strictly to tasks where `developerId === req.user.userId`. Tampering with request payloads or IDs returns `403 Forbidden`.
  - Project Managers can only create tasks within projects where `project.managerId === req.user.userId`.
  - Admins retain organization-wide visibility.

---

## 📝 Assessment Submission Explanation (150–250 Words)

> **The hardest problem you solved, how you handled the real-time role-filtered feed, and one thing you'd do differently:**

Honestly, the hardest part was the activity feed - getting real-time updates scoped correctly per role. Devs should only see their own task events, PMs only their managed projects, admins need everything. Three different visibility rules on one stream.

I used Socket.io with rooms, auth'd via JWT on handshake. Each socket joins its user room, role room, and any project rooms it manages. When a task changes, the server first writes it to an ActivityLog table in Postgres, then emits only to the rooms allowed to see it -admin, the project's manager, the task's assigned dev.

For offline recovery, instead of buffering events in memory (messy - what if the server restarts mid-session?), reconnecting sockets fire a catchup event that pulls the last 20 role-scoped records straight from Postgres. Not fancy, but always consistent.

If this went to production, I'd swap node-cron for BullMQ + Redis locks, so scaling to multiple instances doesn't cause duplicate job runs.

---

## ⚠️ Known Limitations & Future Roadmap

1. **Single-Instance Cron**: The background cron runs within the Node.js process. In a horizontally scaled cluster, BullMQ or pg-boss with Redis/PostgreSQL advisory locks should be adopted.
2. **WebSocket Clustering**: To scale WebSockets across multiple server replicas, Socket.io Redis Adapter would be introduced for cross-node event broadcasting.
3. **File Attachments**: Tasks currently support title and rich markdown descriptions; S3/Cloudflare R2 attachment uploads can be added as a next iteration.
