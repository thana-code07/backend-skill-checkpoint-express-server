# Quora-like Q&A API

A RESTful backend server for a Q&A application (similar to Quora), built with **Express** and **PostgreSQL**. It lets clients create and manage questions, post answers, and vote on both questions and answers.

## Features

- **Questions** – create, read, update, delete, and search questions.
- **Answers** – list, create, and delete answers for a given question.
- **Voting** – upvote or downvote questions and answers.
- **Validation & guards** – request-body validation and existence checks via reusable middleware.

## Tech Stack

- **Node.js** with ES Modules (`"type": "module"`)
- **Express** `^4.19.2` – web framework
- **pg** `^8.22.0` – PostgreSQL client
- **nodemon** `^3.1.4` – dev auto-reload

## Project Structure

```
backend-skill-checkpoint-express-server/
├── app.mjs                          # App entry point, mounts routers
├── routes/
│   ├── questions.js                 # /questions routes
│   └── answers.js                   # /questions/:questionID/answers routes
├── middlewares/
│   ├── validateQuestion.mjs         # Validates question body
│   ├── validateAnswer.mjs           # Validates answer body (max 300 chars)
│   ├── validateVote.mjs             # Ensures vote is 1 or -1
│   ├── checkQuestionExists.mjs      # 404 if question doesn't exist
│   └── checkAnswerExists.mjs        # 404 if answer doesn't exist
├── utils/
│   └── db.mjs                       # PostgreSQL connection pool
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A running PostgreSQL instance

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the database

The database connection is defined in `utils/db.mjs`:

```js
const connectionPool = new Pool({
  connectionString: "postgresql://postgres:<password>@localhost:5432/quora",
});
```

Update the connection string to match your PostgreSQL credentials and database name.

> **Note:** The credentials are currently hard-coded. For real usage, move them to an environment variable (e.g. `process.env.DATABASE_URL`) and keep secrets out of source control.

### 3. Create the database schema

Create a `quora` database and the following tables:

```sql
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255)
);


CREATE TABLE IF NOT EXISTS answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    content TEXT
);


CREATE TABLE IF NOT EXISTS question_votes (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    vote INTEGER CHECK (vote = 1 OR vote = -1)
);


CREATE TABLE IF NOT EXISTS answer_votes (
    id SERIAL PRIMARY KEY,
    answer_id INTEGER REFERENCES answers(id) ON DELETE CASCADE,
    vote INTEGER CHECK (vote = 1 OR vote = -1)
);
```

### 4. Run the server

```bash
npm start
```

The server runs on **http://localhost:4000**. Visit `GET /test` to confirm it's up.

## API Endpoints

Base URL: `http://localhost:4000`

### Health check

| Method | Endpoint | Description                                      |
| ------ | -------- | ------------------------------------------------ |
| GET    | `/test`  | Returns a message confirming the API is working. |

### Questions

| Method | Endpoint                             | Description                                                            |
| ------ | ------------------------------------ | ---------------------------------------------------------------------- | ------ |
| GET    | `/questions`                         | Get all questions.                                                     |
| GET    | `/questions/search?title=&category=` | Search questions by `title` and/or `category` (at least one required). |
| GET    | `/questions/:questionID`             | Get a single question by ID.                                           |
| POST   | `/questions`                         | Create a question. Body: `{ title, description, category }`.           |
| PUT    | `/questions/:questionID`             | Update a question. Body: `{ title, description, category }`.           |
| DELETE | `/questions/:questionID`             | Delete a question.                                                     |
| POST   | `/questions/:questionID/vote`        | Vote on a question. Body: `{ vote: 1                                   | -1 }`. |

### Answers

| Method | Endpoint                                        | Description                                            |
| ------ | ----------------------------------------------- | ------------------------------------------------------ | ------ |
| GET    | `/questions/:questionID/answers`                | Get all answers for a question.                        |
| POST   | `/questions/:questionID/answers`                | Create an answer. Body: `{ content }` (max 300 chars). |
| DELETE | `/questions/:questionID/answers`                | Delete all answers for a question.                     |
| POST   | `/questions/:questionID/answers/:answerID/vote` | Vote on an answer. Body: `{ vote: 1                    | -1 }`. |

## Request & Validation Rules

- **Question body** (`POST`/`PUT`): `title`, `description`, and `category` are all required, non-empty strings.
- **Answer body** (`POST`): `content` is a required, non-empty string, no longer than 300 characters.
- **Vote body**: `vote` must be exactly `1` (upvote) or `-1` (downvote).

## Example Requests

Create a question:

```bash
curl -X POST http://localhost:4000/questions \
  -H "Content-Type: application/json" \
  -d '{"title":"What is Express?","description":"Explain the framework.","category":"Node.js"}'
```

Post an answer:

```bash
curl -X POST http://localhost:4000/questions/1/answers \
  -H "Content-Type: application/json" \
  -d '{"content":"Express is a minimal Node.js web framework."}'
```

Vote on a question:

```bash
curl -X POST http://localhost:4000/questions/1/vote \
  -H "Content-Type: application/json" \
  -d '{"vote":1}'
```

## Response Format

- Successful reads return `{ "data": ... }`.
- Successful writes return `{ "message": "..." }`.
- Errors return an appropriate status code (`400`, `404`, `500`) with `{ "message": "..." }`.
