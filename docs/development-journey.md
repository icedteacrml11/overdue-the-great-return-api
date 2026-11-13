# Development journey: Overdue: The Great Return API

Student: Carl Angelo Orlina · Section: 3-2 · Group: Solo

One entry per milestone, written the week you did it. Newest at the bottom.

## M1 · Accounts, passwords and tokens
- Dates worked: Nov 13, 2026 · Time spent: 3 hours
- Goal: Replace the temporary `X-Demo-User` header with real account registration, bcrypt password hashing, and signed JWT bearer tokens.
- What I built: `db/migrations/20261113000001-add-password-hash-to-users.js`, `src/validators/auth.validator.js`, `src/services/auth.service.js`, `src/controllers/auth.controller.js`, `src/routes/auth.routes.js`, `src/routes/user.routes.js` (`POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `GET /api/v1/users`, `PATCH /api/v1/users/:id/role`), and updated seeders + Postman collection (41 requests).
- Evidence: https://github.com/icedteacrml11/overdue-the-great-return-api/pull/3 · commits `9b4b248`, `954eea0`, `57c6c3a`
- Problem I hit: After installing the Weeks 12–18 kit, all existing Week 11 Postman requests returned `401 AUTH_REQUIRED`, and `User.create()` in Sequelize kept `password_hash` on the in-memory model instance even with `defaultScope` excluding `password_hash`.
- How I solved it: Added login requests at the start of the Postman collection to store `hostToken`, `otherHostToken`, `playerToken`, `player2Token`, and `adminToken` in collection variables and switched all protected requests to `Authorization: Bearer {{...Token}}`; also re-queried the newly created user via `userRepository.findById` and filtered fields through `toUserJson` in the controller so `password_hash` can never leak.
- Decision I made and why: Required passwords to be 8–72 characters with at least one letter and one number, and ignored any `role` sent in `POST /auth/register` so self-registered accounts always start as `PLAYER` and only an `ADMIN` can promote accounts via `PATCH /users/:id/role`.
- Changes to my design set: Added `password_hash VARCHAR(60)` to `users` and added the `/api/v1/auth/*` and `/api/v1/users/*` endpoints to the endpoint table.
- What I would explain to a classmate: Why `POST /auth/login` compares against a dummy bcrypt hash (`DUMMY_HASH`) when the `school_id` does not exist and returns the exact same `401 INVALID_CREDENTIALS` message — otherwise an attacker could tell which school IDs are registered by either the error message or the response time.

## M2 · The question bank
- Dates worked: Nov 14, 2026 · Time spent: 3 hours
- Goal: Add offset pagination, allow-listed sorting, search (`?q=`), eager-loaded questions/choices (`?include=questions`), transactional question/choice CRUD, and safe cover image uploads (`PUT /question-sets/:id/cover`).
- What I built: `db/migrations/20261114000001-add-cover-to-question-sets.js`, `src/models/question.js`, `src/models/choice.js`, `src/repositories/question.repository.js`, updated `src/repositories/question-set.repository.js`, `src/validators/question-set.validator.js`, `src/services/question-set.service.js`, `src/controllers/question-set.controller.js`, `src/routes/question-set.routes.js`, and `src/app.js` (`/uploads` static serving), plus the `"Question bank"` Postman folder (61 requests total).
- Evidence: https://github.com/icedteacrml11/overdue-the-great-return-api/pull/4 · commits `97c31b8`, `f102140`
- Problem I hit: Creating a question and its 2–4 choices required multiple inserts that could leave orphan rows if one failed, and editing a question set already referenced by a played session could corrupt historical game results.
- How I solved it: Wrapped question + choice creation and updates in `sequelize.transaction(async (t) => ...)` passing `{ transaction: t }` to every query, and added `ensureMutable(setId)` (checking `sessionRepository.countByQuestionSet(setId) > 0`) to throw `409 QUESTION_SET_IN_USE` whenever a used question set is modified.
- Decision I made and why: Had the server compute `position` automatically (`MAX(position) + 1` for questions and `1..N` for choices) and required exactly one `is_correct: true` choice (`400 VALIDATION_FAILED`) so clients cannot create invalid or colliding question positions.
- Changes to my design set: Added nullable `cover_url VARCHAR(255)` to `question_sets` and added `PUT /question-sets/:id/cover` and `GET/POST/PATCH/DELETE /question-sets/:id/questions(/:questionId)` to the endpoint table.
- What I would explain to a classmate: Why `sort` column names cannot use SQL bind parameters (`$1`) and must be validated against a strict allow-list (`isIn(['id', 'title', 'created_at'])`), whereas search terms (`?q=`) are values that Sequelize binds safely with `Op.iLike`.

## M3 · Gameplay
- Dates worked: Nov 14, 2026 · Time spent: 3 hours
- Goal: Implement live session question progression, server-timed answer scoring with transactions, competition-rank leaderboards, and full end-to-end gameplay verification.
- What I built: `db/migrations/20261114000002-add-gameplay-columns-to-sessions.js`, `src/models/player-answer.js`, `src/repositories/answer.repository.js`, `src/services/gameplay.service.js` (`pointsFor`, `getCurrentQuestion`, `submitAnswer`, `getLeaderboard`), and updated `src/services/session.service.js`, `src/validators/session.validator.js`, `src/controllers/session.controller.js`, `src/routes/session.routes.js`, `src/repositories/results.repository.js`, and the `"Play a whole game"` Postman folder (79 requests total).
- Evidence: `feature/gameplay` PR · commits `c8e5273`
- Problem I hit: In `GET /results`, an active session that was immediately closed without playing questions originally counted seats with 0 answers as `completed: true`, which failed Criterion J unless completion required answering every question in the set.
- How I solved it: Updated `results.repository.js` so `completed` is true only when a player has answered all questions in the session's question set (or reached the seeded `distance_progress >= 5` threshold), and had `"Play a whole game"` play through both questions before closing the session.
- Decision I made and why: Kept `is_correct` completely stripped from `GET /sessions/:code/question` via `toPublicQuestionJson` and calculated `elapsed_ms` on the server from `session.question_started_at` so clients can neither see the answer key nor forge fast response times.
- Changes to my design set: Added `current_position` and `question_started_at` to `sessions`, added `points_awarded` and `elapsed_ms` to `player_answers`, and consolidated question advancement into `PATCH /sessions/:code` (`{ current_position }`) instead of a separate `/next` route.
- What I would explain to a classmate: Why `seat.increment('score', { by: points, transaction: t })` inside a database transaction is safer than reading `seat.score` in JavaScript and writing `seat.score + points` — `increment` adds atomically in PostgreSQL so concurrent updates never overwrite each other.

## M4 · Automated tests and server preparation
- Dates worked: Nov 14, 2026 · Time spent: 3 hours
- Goal: Build an automated Jest unit and Supertest HTTP test suite with 60%+ line coverage and prepare the Express server and database configuration for cloud deployment on Render.
- What I built: Unit test suites (`tests/unit/gameplay.service.test.js`, `tests/unit/auth.service.test.js`, `tests/unit/question-set.service.test.js`) with `jest.mock`, HTTP test suites (`tests/api/auth.api.test.js`, `tests/api/question-sets.api.test.js`, `tests/api/sessions.api.test.js`) with `supertest`, CORS and Helmet security middleware in `src/app.js`, `DATABASE_URL` and `DB_SSL` support in `src/config/env.js`, `src/config/database.js`, and `src/models/index.js`, `"start:render"` / `"test"` / `"test:coverage"` scripts in `package.json`, and updated `render.yaml`.
- Evidence: `feature/tests` PR · 31 Jest tests across 8 test suites (90%+ line coverage)
- Problem I hit: Running multiple `supertest` files in Jest caused open database handle warnings when each file imported `src/models/index.js` in its own Jest module registry without closing its Sequelize connection pool.
- How I solved it: Added `afterAll(() => sequelize.close())` to every HTTP test suite in `tests/api/` and ran Jest sequentially with `--runInBand` so the shared `<DB_NAME>_test` database has no cross-file race conditions.
- Decision I made and why: Configured `start:render` to run `sequelize-cli db:migrate && node scripts/create-admin.js && node src/server.js` without running `db:seed:all` in production, so demo accounts with known passwords are never created on the public server.
- Changes to my design set: Added `trust proxy`, `helmet`, and origin-allowlisted `cors` middleware to `src/app.js`, and added `DATABASE_URL` / `DB_SSL` connection support to `src/config/env.js` and `src/config/database.js`.
- What I would explain to a classmate: The difference between a unit test (which uses `jest.mock(...)` to replace repositories and test pure business logic like `pointsFor` in milliseconds without touching PostgreSQL) and an HTTP test (which uses `supertest` to send a real request through middleware, validators, controllers, services, and repositories against `<DB_NAME>_test`).

## M5 · API documentation and deployment
- Dates worked: Nov 14, 2026 · Time spent: 3 hours
- Goal: Document every endpoint in OpenAPI 3, serve it with Swagger UI, and deploy the API and its PostgreSQL database to Render with the Blueprint in `render.yaml`.
- What I built: mounted `src/routes/docs.routes.js` in `src/routes/index.js` before `currentUser` (`GET /api/v1/openapi.json` and Swagger UI at `/api/v1/docs/`); wrote `src/docs/openapi.yaml` with reusable schemas (`User`, `QuestionSet`, `Question`, `Choice`, `PublicQuestion`, `Session`, `Meta`, `Error`), shared path parameters and error responses, and 26 documented operations across the Hub Contract, Accounts, Question Sets and Sessions tags; turned on `tests/api/docs.api.test.js` (33 Jest tests in 9 files).
- Evidence: `feature/api-docs` PR
- Problem I hit: The kit's starter spec had lines that YAML read as keys with null values (`oldest first: null`, `the same answer for an unknown school ID and a wrong password: null`) because a description ran onto a second line, and my `/results` error was documented as `VALIDATION_FAILED` even though the controller answers `400 INVALID_SINCE`.
- How I solved it: Rewrote those descriptions on one line, then compared every documented response against the controller's `toJson` and the error codes in the services, validators and `constraint-map.js`, so Swagger shows exactly what the API sends.
- Decision I made and why: Documented `PublicQuestion`/`PublicChoice` as separate schemas without `is_correct`, so anyone reading the docs can see that players never receive the answer key, while hosts' `Question`/`Choice` schemas include it.
- Changes to my design set: No endpoint changed. The docs routes are new and open to everyone, like the Hub Contract endpoints.
- What I would explain to a classmate: `components` holds a schema or response once and every path points to it with `$ref`, so changing the `Error` shape in one place updates all 26 operations; and the `bearerAuth` security scheme is what makes Swagger's Authorize button send `Authorization: Bearer <token>`.

## M6 · The SE1 portfolio and the release

## M7 · The Test Report
