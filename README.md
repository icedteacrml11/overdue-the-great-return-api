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

## Endpoints (Hub Contract v1.2)

Base URL: `http://localhost:3001/api/v1`

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | /health | Is the API up and can it reach the database? | 200 (503 when the database is down) |
| GET | /game-info | Slug, name, group, developer, description, player limits, version | 200 |
| GET | /results | Finished games, every player, and the top 3. Needs the `X-Hub-Key` header. Optional `?since=` | 200 (401 without the key) |

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
