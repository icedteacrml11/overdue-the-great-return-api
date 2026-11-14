# Changelog

All notable changes, newest first.

## 1.0.0 (Weeks 15 to 16): API documentation, Render deployment, and SE1 portfolio
- Mounted Swagger UI (`/api/v1/docs/`) and OpenAPI 3 specification (`/api/v1/openapi.json` via `src/docs/openapi.yaml`) documenting all 26 operations with schemas, validator limits, and error codes; enabled `tests/api/docs.api.test.js` (`33` Jest tests in `9` files, `92.03%` line coverage).
- Moved `sequelize-cli` to production `dependencies`, hardened `uploads/covers` runtime directory creation, updated `render.yaml`, and deployed live on Render (`https://overdue-the-great-return-orlina.onrender.com/api/v1`).
- Generated `docs/data-dictionary.md` (`7` tables) and `docs/api-reference.md` (`26` operations), completed `docs/technical-spec.md`, `docs/user-guide.md`, and `docs/se2-handoff.md`, added six as-built PNG diagrams under `docs/diagrams/`, and finalized the Week 16 SE1 portfolio release `v1.0.0`.

## 0.4.0 (Week 14): Automated tests and server preparation
- Added Jest unit tests (`tests/unit/gameplay.service.test.js`, `tests/unit/auth.service.test.js`, `tests/unit/question-set.service.test.js`) with `jest.mock` and Supertest HTTP integration tests (`tests/api/auth.api.test.js`, `tests/api/question-sets.api.test.js`, `tests/api/sessions.api.test.js`) against `<DB_NAME>_test`.
- Added `trust proxy`, `helmet`, and origin-allowlisted `cors` middleware in `src/app.js`, plus `DATABASE_URL` and `DB_SSL` support in `src/config/env.js`, `src/config/database.js`, and `src/models/index.js`.
- Added `"start:render"`, `"test"`, and `"test:coverage"` scripts in `package.json`, and configured the Render Blueprint in `render.yaml`.

## 0.3.0 (Week 13): Question bank and live gameplay
- Added pagination, allow-listed `?sort=`, search (`?q=`), `?include=questions` eager loading, transactional question/choice CRUD, frozen-if-used (`409 QUESTION_SET_IN_USE`) protection, and cover image uploads (`PUT /question-sets/:id/cover`) with `multer`.
- Added live question progression (`PATCH /sessions/:code`), `GET /sessions/:code/question` without exposing `is_correct`, server-timed transactional answer scoring (`POST /sessions/:code/answers`, `pointsFor`), session leaderboard rankings (`GET /sessions/:code/leaderboard`), and full Postman gameplay coverage (`79` requests).

## 0.2.0 (Week 12): Accounts, passwords, and JWT tokens
- Added `password_hash` migration and idempotent demo password seeder (`db/seeders/20261113000001-demo-passwords.js`).
- Added `POST /auth/register`, constant-time `POST /auth/login` with dummy bcrypt hashing, `GET /auth/me`, and `ADMIN`-only `GET /users` and `PATCH /users/:id/role` (`409 SELF_ROLE_CHANGE`); replaced temporary `X-Demo-User` authentication with `Authorization: Bearer <token>`.

## 0.1.0 (Weeks 10 to 11): Foundation, database schema, and Hub Contract v1.2
- Built the initial Express 5 layered architecture (`routes`, `validators`, `controllers`, `services`, `repositories`, `models`, centralized `errorHandler`, and PostgreSQL `constraint-map.js`).
- Added initial migrations and seed data for the `7` core tables (`users`, `question_sets`, `questions`, `choices`, `sessions`, `session_players`, `player_answers`).
- Implemented Hub Contract endpoints (`GET /health`, `GET /game-info`, `GET /results` with `X-Hub-Key`), question-set CRUD, and session lobby/join endpoints (`201` join / `200` rejoin).
