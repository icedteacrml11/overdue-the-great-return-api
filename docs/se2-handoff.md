# SE2 handoff: building the Overdue: The Great Return frontend

## Connection

| Item | Value |
|---|---|
| Base URL (production) | `https://overdue-the-great-return-orlina.onrender.com/api/v1` |
| Base URL (local) | `http://localhost:3001/api/v1` |
| Contract | Hub Contract v1.3; Swagger UI at `/api/v1/docs/`, OpenAPI spec at `/api/v1/openapi.json` (`src/docs/openapi.yaml`) |
| CORS | Browser requests require the frontend's origin (e.g., `http://localhost:5173` locally, plus your deployed SE2 frontend origin in Render's `CORS_ORIGINS` comma-separated environment variable). Requests from unlisted origins omit `Access-Control-Allow-Origin`. |
| Login | Call `POST /auth/login` with `{ school_id, password }` and store `{ token, user }`. Send `Authorization: Bearer <token>` on all protected requests. If any call responds `401` (`AUTH_REQUIRED` or `INVALID_TOKEN`), clear the stored token and redirect to the login screen. |
| First request | The free Render service sleeps after 15 minutes of inactivity and takes ~45–60 seconds to wake. Call `GET /health` on app boot with a loading/waking indicator before triggering timed gameplay or mutations. Note also that the free PostgreSQL database created on `2026-11-14` expires after 30 days (`2026-12-14`) unless upgraded or recreated. |

## Screens and the endpoints they use

| Screen | Endpoints |
|---|---|
| Login & Register | `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `GET /health` |
| Admin User Management | `GET /users`, `PATCH /users/{id}/role` (`409 SELF_ROLE_CHANGE` handled cleanly) |
| Host Question Bank List | `GET /question-sets?page=&limit=&sort=&order=&q=`, `POST /question-sets`, `DELETE /question-sets/{id}` |
| Host Question Set Editor & Cover Upload | `GET /question-sets/{id}?include=questions`, `PATCH /question-sets/{id}`, `PUT /question-sets/{id}/cover`, `POST /question-sets/{id}/questions`, `PATCH /question-sets/{id}/questions/{questionId}`, `DELETE /question-sets/{id}/questions/{questionId}` |
| Host Lobby & Game Control | `POST /sessions`, `GET /sessions/{code}`, `GET /sessions/{code}/players`, `PATCH /sessions/{code}` (`status: RUNNING`, `current_position: N`, `status: FINISHED`) |
| Player Lobby Join / Rejoin | `GET /sessions/{code}`, `POST /sessions/{code}/players` (treats `201` join and `200 rejoined: true` identically), `GET /sessions/{code}/players` |
| Live Trivia & Book-Return Track | `GET /sessions/{code}/question` (poll while active), `POST /sessions/{code}/answers`, `GET /sessions/{code}/leaderboard` |
| Post-Game Podium | `GET /sessions/{code}`, `GET /sessions/{code}/leaderboard?limit=10`, `GET /game-info` |

## Known limits and the SE2 backlog

1. **Add real-time push updates or synchronized polling UX:** SE1 uses HTTP polling for session state (`status`, `current_position`) and player/leaderboard updates. Adding WebSockets (Socket.IO or SSE) or synchronized client polling timers in SE2 will eliminate countdown drift between host and players.
2. **Add cloud object storage for cover uploads:** `PUT /question-sets/{id}/cover` currently saves files to local disk under `uploads/covers/`, which wipes on Render container restarts/redeploys because the free plan has no persistent disk. Moving uploads to S3, Cloudinary, or Supabase Storage preserves cover art permanently.
3. **Host UI helpers for frozen question sets:** Editing any set already used in a session returns `409 QUESTION_SET_IN_USE`. SE2 should add a "Duplicate Question Set" workflow (calling `GET /question-sets/{id}?include=questions`, `POST /question-sets`, and `POST /questions`) so hosts can clone and modify past quizzes without SQL workarounds.
4. **Inactivity / session-expiry handling and refresh tokens:** Tokens currently expire according to `JWT_EXPIRES_IN` (`1h` on Render). SE2 should warn users before expiration or trigger clean re-authentication prompts without losing draft question-set forms.
5. **Provision fresh production database after 30 days:** The Render free PostgreSQL plan expires 30 days after creation (`2026-12-14`). Before SE2 testing against Render, recreate or upgrade the Render PostgreSQL instance and re-run Blueprint sync (`npm run start:render`).
