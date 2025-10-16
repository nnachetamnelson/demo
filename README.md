## Unified Education Backend

This repository runs as a single modular Express application (modular monolith) with a PostgreSQL database. Simple, efficient, and easy to deploy.

### Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **ORM**: Sequelize

### Entrypoint
- App entry: `server.js`
- Start scripts in root `package.json`

### Quick start
1. Install deps
   - `npm install`
2. Set environment variables (e.g. in `.env`)
   - `DB_HOST` (default: `localhost`)
   - `DB_NAME` (default: `education`)
   - `DB_USER` (default: `postgres`)
   - `DB_PASSWORD` (default: `secret`)
   - `DB_PORT` (default: `5432`)
   - `DB_DIALECT` (default: `postgres`)
   - `JWT_SECRET` (required for authentication)
3. Run
   - Dev: `npm run dev`
   - Prod: `npm start`

### Docker Deployment
Run the entire stack with Docker Compose:
```bash
docker-compose up
```
This will start:
- PostgreSQL database on port 5432
- Backend API on port 4000
- Frontend on port 5173

### API routes
- Public:
  - `/api/auth/*`
- Protected (JWT):
  - `/api/profiles/*`
  - `/api/students/*`
  - `/api/classroom/*`
  - `/api/attendance/*`
  - `/api/exams/*`
  - `/api/reports/*`
  - `/api/notifications/*`
  - `/api/portal/*`
- Compatibility:
  - `/v1/profiles/*` (kept for existing auth → profile sync)

### Multi-tenancy
- `tenantId` is embedded in JWT and available as `req.user.tenantId`
- All tables include a `tenantId` column and are queried with tenant scope
- Ensures complete data isolation between different schools/organizations

### Shared modules
- `shared/db/sequelize.js`: single Sequelize instance
- `shared/db/models.js`: central model registry and associations
- `shared/models/*`: deduplicated models used across domains
- `shared/auth/authMiddleware.js`: JWT validation
- `shared/logger/logger.js`: app logger

### Associations (centralized)
- Defined once in `shared/db/models.js` (students ↔ parents, classes, subjects, exams, etc.)

### Notifications
- Notifications are sent directly (email/SMS/in-app) without queuing
- See `Notification-service/src/controllers/notification-controller.js`
- Email and SMS services can be configured in `Notification-service/src/services/`

### Adding a new model
1. Create `shared/models/YourModel.js` (binds to shared Sequelize)
2. Import it in `shared/db/models.js` and export via `models`
3. Add associations in `applyAssociations()` if needed
4. Run the app to `sync` tables (non-destructive)

### Adding a new route
1. Create a router file (prefer within an existing domain folder or a new folder)
2. Mount it in `server.js` under `/api/<namespace>`
3. Protect with `shared/auth/authMiddleware.validateToken` as needed

### Notes
- Per-service `server.js`, `package.json`, logs, and debug assets were removed
- DB schema is synced with `sequelize.sync({ force: false })`. For production migrations, consider introducing a migration tool (e.g., Sequelize CLI/Umzug)

### Troubleshooting
- **Database connection issues**: Ensure PostgreSQL is running and environment variables are set correctly
- **JWT issues**: Confirm `JWT_SECRET` is set and Authorization headers are passed as `Bearer <token>`
- **Port conflicts**: If ports 4000, 5173, or 5432 are in use, update `docker-compose.yml` or `.env` accordingly


