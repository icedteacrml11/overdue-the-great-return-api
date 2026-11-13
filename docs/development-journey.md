# Development journey: Overdue: The Great Return API

Student: Carl Angelo Orlina · Section: 3-2 · Group: Solo

One entry per milestone, written the week you did it. Newest at the bottom.

## M1 · Accounts, passwords and tokens
- Dates worked: Nov 13, 2026 · Time spent: 3 hours
- Goal: Replace the temporary `X-Demo-User` header with real account registration, bcrypt password hashing, and signed JWT bearer tokens.
- What I built: `db/migrations/20261113000001-add-password-hash-to-users.js`, `src/validators/auth.validator.js`, `src/services/auth.service.js`, `src/controllers/auth.controller.js`, `src/routes/auth.routes.js`, `src/routes/user.routes.js` (`POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `GET /api/v1/users`, `PATCH /api/v1/users/:id/role`), and updated seeders + Postman collection (41 requests).
- Evidence: `feature/auth` PR · commits `9b4b248`, `954eea0`
- Problem I hit: After installing the Weeks 12–18 kit, all existing Week 11 Postman requests returned `401 AUTH_REQUIRED`, and `User.create()` in Sequelize kept `password_hash` on the in-memory model instance even with `defaultScope` excluding `password_hash`.
- How I solved it: Added login requests at the start of the Postman collection to store `hostToken`, `otherHostToken`, `playerToken`, `player2Token`, and `adminToken` in collection variables and switched all protected requests to `Authorization: Bearer {{...Token}}`; also re-queried the newly created user via `userRepository.findById` and filtered fields through `toUserJson` in the controller so `password_hash` can never leak.
- Decision I made and why: Required passwords to be 8–72 characters with at least one letter and one number, and ignored any `role` sent in `POST /auth/register` so self-registered accounts always start as `PLAYER` and only an `ADMIN` can promote accounts via `PATCH /users/:id/role`.
- Changes to my design set: Added `password_hash VARCHAR(60)` to `users` and added the `/api/v1/auth/*` and `/api/v1/users/*` endpoints to the endpoint table.
- What I would explain to a classmate: Why `POST /auth/login` compares against a dummy bcrypt hash (`DUMMY_HASH`) when the `school_id` does not exist and returns the exact same `401 INVALID_CREDENTIALS` message — otherwise an attacker could tell which school IDs are registered by either the error message or the response time.

## M2 · The question bank

## M3 · Gameplay

## M4 · Automated tests and server preparation

## M5 · API documentation and deployment

## M6 · The SE1 portfolio and the release

## M7 · The Test Report
