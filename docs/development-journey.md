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
- Evidence: `feature/question-bank` PR · commits `97c31b8`
- Problem I hit: Creating a question and its 2–4 choices required multiple inserts that could leave orphan rows if one failed, and editing a question set already referenced by a played session could corrupt historical game results.
- How I solved it: Wrapped question + choice creation and updates in `sequelize.transaction(async (t) => ...)` passing `{ transaction: t }` to every query, and added `ensureMutable(setId)` (checking `sessionRepository.countByQuestionSet(setId) > 0`) to throw `409 QUESTION_SET_IN_USE` whenever a used question set is modified.
- Decision I made and why: Had the server compute `position` automatically (`MAX(position) + 1` for questions and `1..N` for choices) and required exactly one `is_correct: true` choice (`400 VALIDATION_FAILED`) so clients cannot create invalid or colliding question positions.
- Changes to my design set: Added nullable `cover_url VARCHAR(255)` to `question_sets` and added `PUT /question-sets/:id/cover` and `GET/POST/PATCH/DELETE /question-sets/:id/questions(/:questionId)` to the endpoint table.
- What I would explain to a classmate: Why `sort` column names cannot use SQL bind parameters (`$1`) and must be validated against a strict allow-list (`isIn(['id', 'title', 'created_at'])`), whereas search terms (`?q=`) are values that Sequelize binds safely with `Op.iLike`.

## M3 · Gameplay

## M4 · Automated tests and server preparation

## M5 · API documentation and deployment

## M6 · The SE1 portfolio and the release

## M7 · The Test Report
