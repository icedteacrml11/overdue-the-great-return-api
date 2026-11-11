# Overdue: The Great Return API

Backend API for **Overdue: The Great Return**, a tournament game for the SorSU Bulan Campus library.
CS 313 Software Engineering 1, A.Y. 2026-2027.

- Developer: Carl Angelo Orlina (icedteacrml11), BSCS 3-2
- Group and game concept: Solo

This is my own build of my group's game concept. Every commit in this repository was made by me, with Git, on my own computer or in my own Codespace.

## Tech stack

| Layer | Tool |
|---|---|
| Runtime | Node.js 22 LTS or newer |
| Web framework | Express 5 |
| Database | PostgreSQL 16 or newer |
| ORM and migrations | Sequelize 6 with sequelize-cli |

## Setup

```
git clone https://github.com/icedteacrml11/overdue-the-great-return-api.git
cd overdue-the-great-return-api
npm install
```

Copy `.env.example` to `.env`, then put your own PostgreSQL password in `DB_PASSWORD`.

```
npm run db:create     (first time only)
npm run db:migrate
npm run db:seed
npm run db:check
npm run dev
```

## Environment variables

| Key | Example | Purpose |
|---|---|---|
| NODE_ENV | development | Which config block to use |
| PORT | 3001 | Port the API listens on (the library assigns the final port at deployment) |
| DB_HOST | 127.0.0.1 | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | overdue_db | Database name: your game slug, with underscores |
| DB_USER | postgres | Database user |
| DB_PASSWORD | (your own) | Database password. Never commit this. |
| HUB_API_KEY | dev-hub-key | Key the Library Game Hub sends to read results. The library gives the real one at deployment. |

## Endpoints

Base URL: `http://localhost:3001/api/v1`

### Hub Contract v1.2

| Method | Path | Who may call it | Purpose | Success |
|---|---|---|---|---|
| GET | /health | Anyone | Is the API up and can it reach the database? | 200 (503 when the database is down) |
| GET | /game-info | Anyone | Slug, name, group, developer, description, player limits, version | 200 |
| GET | /results | Library Game Hub (`X-Hub-Key`) | Finished games, every player, and the top 3. Optional `?since=` | 200 (401 without the key) |

### Module 1: Question Sets

| Verb | URL | Who may call it | What it does | Success |
|---|---|---|---|---|
| GET | /question-sets | A host or admin | Lists the caller's question sets (or all sets for an admin) | 200 |
| POST | /question-sets | A host or admin | Creates a new question set owned by the caller | 201 |
| GET | /question-sets/:id | The owner host or admin | Reads one question set by its id | 200 |
| PATCH | /question-sets/:id | The owner host or admin | Updates a question set's title | 200 |
| DELETE | /question-sets/:id | The owner host or admin | Deletes an unused question set | 204 |

### Module 2: Sessions and Players

| Verb | URL | Who may call it | What it does | Success |
|---|---|---|---|---|
| POST | /sessions | A host or admin | Starts a game in `LOBBY` status. The server generates the six-digit `code`. | 201 |
| GET | /sessions/:code | Anyone | Reads one game session by its six-digit code | 200 |
| PATCH | /sessions/:code | The host of that game (or admin) | Changes the session status (`LOBBY` → `ACTIVE` → `FINISHED`) | 200 |
| POST | /sessions/:code/players | Any account | Joins a game in `LOBBY` (`201`) or rejoins an existing seat (`200`) | 201 / 200 |
| GET | /sessions/:code/players | Anyone | Lists nicknames, scores, and distance progress for a game session | 200 |

## What "completed" means in my game

A player has completed the game when they reach a distance progress of 10 by answering trivia questions correctly to return all 10 overdue books, or when they have answered all questions in the active session. A game session is completed (status `FINISHED`) once the first player successfully returns all 10 books or when all questions have concluded, recording the winner in `winner_player_id`.

## Tables

- `users` — Player, host, and admin accounts with authentication credentials and role constraints.
- `question_sets` — Collections of campus and library trivia questions curated by hosts.
- `questions` — Trivia questions with order sequence, question type (`MULTIPLE_CHOICE`, `TRUE_FALSE`), point value, and time limit.
- `choices` — Answer options for each question with position numbering and correctness indicator.
- `sessions` — Multiplayer tournament sessions tracked by unique 6-character join code, lifecycle status, and winner reference.
- `session_players` — Session participants tracking seat assignment, nickname, cumulative score, and distance progress (0–10 books returned).
- `player_answers` — Recorded player answers per question with response time, chosen option, correctness, and points earned.

## Database scripts

| Command | What it does |
|---|---|
| npm run db:migrate | Runs migrations that have not run yet |
| npm run db:migrate:status | Lists every migration as up or down |
| npm run db:seed | Loads the seed data |
| npm run db:check | Counts the rows in every table |
| npm run db:reset | Empties the database, rebuilds every table and reloads the seed data |
| npm run check | Runs the same automatic check that GitHub runs after every push |
