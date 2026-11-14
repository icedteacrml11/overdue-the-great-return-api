# Data dictionary

Generated from the database by `npm run docs:dictionary` on 2026-11-14, then described by hand.

### `choices`

| Column | Type | Null | Default | Keys and rules | Description |
|---|---|---|---|---|---|
| `id` | integer | no | auto number | PK | Auto-incremented unique identifier for an answer choice. |
| `question_id` | integer | no |  | FK REFERENCES questions(id) ON DELETE CASCADE; UNIQUE (uq_question_choice_position) | Question this choice belongs to; deleted automatically if the question is deleted. |
| `choice_text` | character varying(255) | no |  |  | Display text of the answer option (1 to 255 characters). |
| `position` | integer | no |  | UNIQUE (uq_question_choice_position) | Server-assigned 1-based option order (1 to 4) within the question. |
| `is_correct` | boolean | no | `false` |  | True for the single correct answer; hidden from player-facing endpoints. |

### `player_answers`

| Column | Type | Null | Default | Keys and rules | Description |
|---|---|---|---|---|---|
| `id` | integer | no | auto number | PK | Auto-incremented unique identifier for a recorded player answer. |
| `session_player_id` | integer | no |  | FK REFERENCES session_players(id) ON DELETE CASCADE; UNIQUE (uq_one_answer) | Seated player who submitted the answer; paired with question_id to enforce one answer per question. |
| `question_id` | integer | no |  | FK REFERENCES questions(id) ON DELETE CASCADE; UNIQUE (uq_one_answer) | Trivia question that was answered. |
| `choice_id` | integer | yes |  | FK REFERENCES choices(id) ON DELETE SET NULL | Answer choice selected by the player (null if the choice is later removed). |
| `is_correct` | boolean | no |  |  | Whether the selected choice matched the question's correct choice and fell within the time limit. |
| `answered_at` | timestamp with time zone | no | `now()` |  | Server UTC timestamp when the answer was recorded. |
| `points_awarded` | integer | no | `0` |  | Speed-scaled points awarded by pointsFor() for this answer (0 to 1000). |
| `elapsed_ms` | integer | no | `0` |  | Milliseconds elapsed between session.question_started_at and submission, computed by the server. |

### `question_sets`

| Column | Type | Null | Default | Keys and rules | Description |
|---|---|---|---|---|---|
| `id` | integer | no | auto number | PK | Auto-incremented unique identifier for a trivia question set. |
| `host_id` | integer | no |  | FK REFERENCES users(user_id) ON DELETE CASCADE | Account of the host who owns and manages this question set. |
| `title` | character varying(100) | no |  |  | Human-readable title of the question set (3 to 100 characters). |
| `created_at` | timestamp with time zone | no | `now()` |  | Server UTC timestamp when the question set was created. |
| `cover_url` | character varying(255) | yes |  |  | Optional relative path under /uploads/covers/ for an uploaded PNG or JPEG cover image. |

### `questions`

| Column | Type | Null | Default | Keys and rules | Description |
|---|---|---|---|---|---|
| `id` | integer | no | auto number | PK | Auto-incremented unique identifier for a trivia question. |
| `question_set_id` | integer | no |  | FK REFERENCES question_sets(id) ON DELETE CASCADE; UNIQUE (uq_question_set_position) | Parent question set containing this question. |
| `question_type` | character varying(20) | no |  | CHECK (ck_questions_type) | Question format restricted by DB check constraint to MULTIPLE_CHOICE or TRUE_FALSE. |
| `prompt_text` | text | no |  |  | Question prompt shown to hosts and active players (3 to 500 characters at API validation). |
| `position` | integer | no |  | UNIQUE (uq_question_set_position) | Server-assigned 1-based sequence number of the question inside its question set. |
| `time_limit_seconds` | integer | no | `20` |  | Seconds allowed to answer the question before timing out (5 to 120 seconds). |

### `session_players`

| Column | Type | Null | Default | Keys and rules | Description |
|---|---|---|---|---|---|
| `id` | integer | no | auto number | PK | Auto-incremented unique identifier for a player's seat inside one session. |
| `session_id` | integer | no |  | FK REFERENCES sessions(id) ON DELETE CASCADE; UNIQUE (uq_one_seat); UNIQUE (uq_player_nickname) | Game session this participant joined. |
| `user_id` | integer | no |  | FK REFERENCES users(user_id) ON DELETE CASCADE; UNIQUE (uq_one_seat) | Authenticated user account holding this seat (at most one seat per user per session). |
| `nickname` | character varying(30) | no |  | UNIQUE (uq_player_nickname) | Display name shown on leaderboards and Hub results (unique within a session, 2 to 30 chars). |
| `score` | integer | no | `0` | CHECK (ck_score_non_negative) | Cumulative session score updated atomically via Sequelize increment(); constrained to >= 0. |
| `distance_progress` | integer | no | `0` | CHECK (ck_distance_progress_range) | Books returned on the library race track; constrained between 0 and 10 inclusive. |
| `question_started_at` | timestamp with time zone | yes |  |  | Optional per-player question start timestamp retained from Week 10 schema for timing compatibility. |

### `sessions`

| Column | Type | Null | Default | Keys and rules | Description |
|---|---|---|---|---|---|
| `id` | integer | no | auto number | PK | Auto-incremented unique identifier for a multiplayer game session. |
| `join_code` | character(6) | no |  | UNIQUE (sessions_join_code_key) | Server-generated six-digit code (100000 to 999999) players use to join the lobby. |
| `host_id` | integer | no |  | FK REFERENCES users(user_id) ON DELETE CASCADE | Account of the host controlling this game session. |
| `question_set_id` | integer | no |  | FK REFERENCES question_sets(id) ON DELETE RESTRICT | Question set used by this game; RESTRICT prevents deleting a set once played. |
| `status` | character varying(20) | no | `'LOBBY'` | CHECK (ck_sessions_status) | Current game phase restricted by DB check to LOBBY, ACTIVE, RUNNING, or FINISHED. |
| `winner_player_id` | integer | yes |  | FK REFERENCES session_players(id) ON DELETE SET NULL | Seat ID of the winning player recorded when the session finishes (null in lobby or on empty games). |
| `started_at` | timestamp with time zone | yes |  |  | Server UTC timestamp when the host transitioned the session from LOBBY to ACTIVE/RUNNING. |
| `ended_at` | timestamp with time zone | yes |  |  | Server UTC timestamp when the host transitioned the session to FINISHED (used by ?since=). |
| `created_at` | timestamp with time zone | no | `now()` |  | Server UTC timestamp when the session lobby was opened. |
| `current_position` | integer | no | `0` |  | Current active question position (0 while in LOBBY, 1..N while RUNNING). |
| `question_started_at` | timestamp with time zone | yes |  |  | Server UTC timestamp when the current question became active, used to time answers. |

### `users`

| Column | Type | Null | Default | Keys and rules | Description |
|---|---|---|---|---|---|
| `user_id` | integer | no | auto number | PK | Auto-incremented primary key identifying the user account. |
| `school_id` | character varying(20) | no |  | UNIQUE (users_school_id_key) | Unique institutional ID matching YYYY-NNNN (e.g. 2099-0001) used for login. |
| `full_name` | character varying(100) | no |  |  | User's full display name (2 to 100 characters; never exposed on public session player lists). |
| `email` | character varying(100) | no |  | UNIQUE (users_email_key) | Unique lowercase email address (up to 100 characters). |
| `role` | character varying(20) | no | `'PLAYER'` | CHECK (ck_users_role) | Authorization role restricted by DB check to PLAYER, HOST, or ADMIN; self-registration forces PLAYER. |
| `created_at` | timestamp with time zone | no | `now()` |  | Server UTC timestamp when the account was registered. |
| `password_hash` | character varying(60) | yes |  |  | 60-character bcrypt hash (cost 10) excluded by User defaultScope and never serialized in JSON. |

