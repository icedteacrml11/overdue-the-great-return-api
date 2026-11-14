# User guide: Overdue: The Great Return API

How each kind of user interacts with the API.

- **Live Base URL:** `https://overdue-the-great-return-orlina.onrender.com/api/v1`
- **Local Base URL:** `http://localhost:3001/api/v1`
- **Interactive API Docs (Swagger UI):** `/api/v1/docs/`

Every protected request requires the header `Authorization: Bearer <token>` obtained from login. All error responses follow `{ "error": { "code": "...", "message": "..." } }`.

## Players

1. **Create an account:** Send `POST /auth/register` with `school_id` (`YYYY-NNNN`), `full_name` (2–100 chars), `email`, and `password` (8–72 chars with at least one letter and one number). The server returns `201 Created` with your user object (always assigned role `PLAYER`, even if `role` is sent). Duplicate school IDs or emails answer `409 SCHOOL_ID_TAKEN` or `409 EMAIL_TAKEN`; invalid fields answer `400 VALIDATION_FAILED`.
2. **Log in and keep the token:** Send `POST /auth/login` with `school_id` and `password`. On `200 OK`, store the returned JWT `token` and send it in `Authorization: Bearer <token>` on authenticated calls (check your current profile anytime with `GET /auth/me`). Wrong passwords and unknown school IDs answer identically with `401 INVALID_CREDENTIALS`.
3. **Join a game (and rejoin safely):** While the session is in `LOBBY`, send `POST /sessions/{code}/players` with `{ "nickname": "..." }` (2–30 characters) using the host's 6-digit code.
   - New seat returns `201 Created` with your `player_id` and initial `score: 0`, `distance_progress: 0`.
   - Rejoining the same session returns `200 OK` (`rejoined: true`) with your existing score and progress preserved—even after the game has started.
   - Duplicate nickname returns `409 NICKNAME_TAKEN`; joining late as a new player returns `409 SESSION_NOT_JOINABLE` (or `409 SESSION_ENDED` / `409 SESSION_FULL`).
4. **Play the game:**
   - Fetch the active trivia question with `GET /sessions/{code}/question` (answers `200 OK` without `is_correct`, or `409 SESSION_NOT_ACTIVE` if not started/already ended).
   - Submit your choice with `POST /sessions/{code}/answers` sending `{ "question_id": ..., "choice_id": ... }`. Answers within `time_limit_seconds` award speed-scaled points (`round(1000 * (1 - elapsed / (2 * limit)))`) and advance `distance_progress` by 1 book (`201 Created`). Answering twice returns `409 ALREADY_ANSWERED`; answering out of turn returns `409 NOT_CURRENT_QUESTION`; choosing an option from another question returns `400 INVALID_CHOICE`.
5. **View progress and leaderboard:** Call `GET /sessions/{code}/players` to see every participant's nickname, score, and `distance_progress`, or `GET /sessions/{code}/leaderboard?limit=10` for ranked standings where equal scores share a rank (`1, 2, 2, 4`).

**When a player counts as completed:** A player counts as `completed: true` in Hub results once they either reach `distance_progress >= 5` or submit answers for all questions in the session's question set.

## Hosts

1. **Prepare a question set and questions:** (Requires `HOST` or `ADMIN` role; `PLAYER` accounts receive `403 FORBIDDEN`.)
   - Call `POST /question-sets` with `{ "title": "..." }` (`3`–`100` chars) to create a set (`201 Created`). Inspect your paginated library anytime with `GET /question-sets?page=1&limit=10&sort=created_at&order=desc&q=keyword` (`400 VALIDATION_FAILED` on invalid `sort`).
   - Add questions via `POST /question-sets/{id}/questions` with `prompt_text` (`3`–`500` chars), optional `question_type` (`MULTIPLE_CHOICE` or `TRUE_FALSE`), optional `time_limit_seconds` (`5`–`120`), and `2`–`4` `choices` where **exact count of `is_correct: true` choices is `1`** (`201 Created`, or `400 VALIDATION_FAILED`).
   - Optionally upload a cover image (`<= 1 MB`, PNG or JPEG) via `PUT /question-sets/{id}/cover` (`multipart/form-data` field `cover`, `200 OK`, `400 INVALID_FILE_TYPE` / `COVER_REQUIRED`, or `413 FILE_TOO_LARGE`). Once a set is used by a session, edits/deletions to the set or its questions return `409 QUESTION_SET_IN_USE`.
2. **Start a lobby and share the join code:** Send `POST /sessions` with `{ "question_set_id": <id> }` (`201 Created`, or `409 EMPTY_QUESTION_SET` if the set has 0 questions). Share the generated 6-digit `code` with players and monitor joined nicknames with `GET /sessions/{code}/players`.
3. **Run the game to completion:**
   - Start Question 1 by sending `PATCH /sessions/{code}` with `{ "status": "RUNNING" }` (`200 OK`, sets `current_position: 1` and `question_started_at`).
   - Advance sequentially (`+1` only) with `PATCH /sessions/{code}` sending `{ "current_position": 2 }` (`409 NOT_NEXT_QUESTION` if skipped, `409 NO_MORE_QUESTIONS` past the last question).
   - End the game with `PATCH /sessions/{code}` sending `{ "status": "FINISHED" }` (`200 OK`, sets `ended_at` and `winner_player_id`), then review standings via `GET /sessions/{code}/leaderboard`.

## Admins

An `ADMIN` manages user accounts and roles and has override read/edit access across question sets and sessions:
- **Bootstrap admin:** On a new server (such as Render), `scripts/create-admin.js` runs at startup using `ADMIN_SCHOOL_ID` and `ADMIN_PASSWORD` from environment variables (without loading seed data).
- **List all accounts:** Call `GET /users` (`200 OK` with `{ users: [...] }`; non-admins get `403 FORBIDDEN`).
- **Promote or demote a user:** Call `PATCH /users/{id}/role` with `{ "role": "HOST" }` (`PLAYER`, `HOST`, or `ADMIN`). Changing your own role is blocked with `409 SELF_ROLE_CHANGE`; unknown user IDs answer `404 USER_NOT_FOUND`.

## The Library Game Hub

- **Health & metadata:** `GET /health` returns `{ status, service, version, database, uptime_seconds, timestamp }` (`200 OK` when up, `503` if PostgreSQL is unreachable). `GET /game-info` returns Hub Contract v1.3 metadata (`slug`, `name`, `team`, `developer`, `description`, `min_players`, `max_players`, `version`).
- **Reading finished results:** Send `GET /results` (optionally with `?since=2026-11-14T00:00:00Z`) and header `X-Hub-Key: <HUB_API_KEY>`. Missing/invalid keys return `401 HUB_KEY_REQUIRED`; invalid `?since=` timestamps return `400 INVALID_SINCE`. Each finished session lists `session_code`, `started_at`, `ended_at`, all `players` (ordered by score/rank, with `rank: null` for incomplete players), and the top 3 `podium` finishers.

## When something goes wrong

Every error returns `{ "error": { "code": "...", "message": "..." } }` (with optional `details` array on field errors):

| Status | Common Codes | Meaning & Resolution |
|---|---|---|
| `400` | `VALIDATION_FAILED`, `INVALID_JSON`, `INVALID_SINCE`, `INVALID_CHOICE`, `INVALID_FILE_TYPE`, `COVER_REQUIRED` | Fix malformed JSON, parameter ranges, non-allowlisted `sort`, missing cover field, wrong image MIME type, or mismatched `choice_id`. |
| `401` | `AUTH_REQUIRED`, `INVALID_TOKEN`, `INVALID_CREDENTIALS`, `HUB_KEY_REQUIRED` | Re-authenticate via `POST /auth/login` for a fresh Bearer JWT, or include a valid `X-Hub-Key` on `/results`. |
| `403` | `FORBIDDEN` | Your account lacks the required role (`HOST`/`ADMIN`), does not own that question set/session, or is not seated in that session. |
| `404` | `NOT_FOUND`, `USER_NOT_FOUND`, `QUESTION_SET_NOT_FOUND`, `QUESTION_NOT_FOUND`, `SESSION_NOT_FOUND` | Check the URL path, account ID, question set/question ID, or 6-digit session join code. |
| `409` | `SCHOOL_ID_TAKEN`, `EMAIL_TAKEN`, `SELF_ROLE_CHANGE`, `QUESTION_SET_IN_USE`, `EMPTY_QUESTION_SET`, `NICKNAME_TAKEN`, `SESSION_NOT_JOINABLE`, `SESSION_ENDED`, `SESSION_NOT_ACTIVE`, `NOT_CURRENT_QUESTION`, `ALREADY_ANSWERED`, `NOT_NEXT_QUESTION`, `NO_MORE_QUESTIONS`, `INVALID_STATUS_CHANGE` | Request was syntactically valid and authorized, but conflicts with game state or uniqueness rules. |
| `413` | `FILE_TOO_LARGE` | Uploaded cover image exceeds the `1 MB` maximum size limit. |
| `503` | `DEGRADED` (`database: "down"`) | Database connection failed; check PostgreSQL health or wake the free Render instance (~1 min cold start). |
