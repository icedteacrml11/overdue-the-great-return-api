# API reference: Overdue: The Great Return API 1.0.0

Generated from `src/docs/openapi.yaml` by `npm run docs:api`. Base URL: `/api/v1`. Try every endpoint in Swagger UI at `/api/v1/docs/`.

Every error answers `{ "error": { "code": "...", "message": "..." } }`. "Login" means the header `Authorization: Bearer <token>`.

## Hub Contract

| Method | Path | What it does | Needs | Answers |
|---|---|---|---|---|
| GET | `/health` | Is the API up, and can it reach the database? | nothing | 200, 503 |
| GET | `/game-info` | What the Hub shows about this game | nothing | 200 |
| GET | `/results` | Finished games, every player, and the podium (rule 7) | X-Hub-Key | 200, 400, 401 |

## Accounts

| Method | Path | What it does | Needs | Answers |
|---|---|---|---|---|
| POST | `/auth/register` | Create a PLAYER account | nothing | 201, 400, 409 |
| POST | `/auth/login` | School ID and password in, a token out | nothing | 200, 400, 401 |
| GET | `/auth/me` | The account of the token | login | 200, 401 |
| GET | `/users` | List every account (admin only) | login | 200, 401, 403 |
| PATCH | `/users/{id}/role` | Change an account's role (admin only) | login | 200, 400, 401, 403, 404, 409 |

## Question Sets

| Method | Path | What it does | Needs | Answers |
|---|---|---|---|---|
| GET | `/question-sets` | List my question sets, one page at a time | login | 200, 400, 401, 403 |
| POST | `/question-sets` | Create a question set owned by the caller | login | 201, 400, 401, 403 |
| GET | `/question-sets/{id}` | Read one question set (optionally with its questions and choices) | login | 200, 400, 401, 403, 404 |
| PATCH | `/question-sets/{id}` | Rename a question set that no game has used | login | 200, 400, 401, 403, 404, 409 |
| DELETE | `/question-sets/{id}` | Delete a question set that no game has used | login | 204, 400, 401, 403, 404, 409 |
| PUT | `/question-sets/{id}/cover` | Upload the cover picture (one PNG or JPEG, at most 1 MB) | login | 200, 400, 401, 403, 404, 413 |
| GET | `/question-sets/{id}/questions` | List the questions and choices of a set, by position | login | 200, 400, 401, 403, 404 |
| POST | `/question-sets/{id}/questions` | Add a question and its 2 to 4 choices (all-or-nothing) | login | 201, 400, 401, 403, 404, 409 |
| PATCH | `/question-sets/{id}/questions/{questionId}` | Change a question, or replace its choices | login | 200, 400, 401, 403, 404, 409 |
| DELETE | `/question-sets/{id}/questions/{questionId}` | Delete a question from a set that no game has used | login | 204, 400, 401, 403, 404, 409 |

## Sessions

| Method | Path | What it does | Needs | Answers |
|---|---|---|---|---|
| POST | `/sessions` | Open a game in LOBBY; the server picks the six-digit code | login | 201, 400, 401, 403, 404, 409 |
| GET | `/sessions/{code}` | Read one game by its join code | nothing | 200, 400, 404 |
| PATCH | `/sessions/{code}` | Start or finish the game, or move to the next question (its host only) | login | 200, 400, 401, 403, 404, 409 |
| GET | `/sessions/{code}/players` | List the players of a game (nicknames and scores only) | nothing | 200, 400, 404 |
| POST | `/sessions/{code}/players` | Join a game in LOBBY (201), or rejoin my seat (200) | login | 200, 201, 400, 401, 404, 409 |
| GET | `/sessions/{code}/question` | The current question and its choices (never is_correct) | nothing | 200, 400, 404, 409 |
| POST | `/sessions/{code}/answers` | Answer the current question; the server times and scores it | login | 201, 400, 401, 403, 404, 409 |
| GET | `/sessions/{code}/leaderboard` | The game's leaderboard; equal scores share a rank (1, 2, 2, 4) | nothing | 200, 400, 404 |

