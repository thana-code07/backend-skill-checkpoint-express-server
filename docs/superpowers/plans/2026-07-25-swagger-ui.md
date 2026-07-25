# Swagger UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve interactive Swagger UI at `/api-docs` documenting all existing Q&A API endpoints, without changing route behavior.

**Architecture:** Add a plain OpenAPI 3.0 JS object in `swagger.mjs` and mount `swagger-ui-express` in `app.mjs`. Route files stay unchanged. Spec schemas mirror current request/response shapes (`{ data }`, `{ message }`).

**Tech Stack:** Express (existing), `swagger-ui-express`, OpenAPI 3.0

## Global Constraints

- UI path must be exactly `/api-docs`
- Spec lives in a single file `swagger.mjs` (no JSDoc on routes, no `openapi.yaml`)
- Do not modify `routes/questions.js` or `routes/answers.js`
- Do not add auth/security schemes
- Server URL in spec: `http://localhost:4000`
- Do not commit unless the user explicitly asks

## File Structure

| File | Responsibility |
|------|----------------|
| `swagger.mjs` (create) | Export `swaggerSpec` OpenAPI 3.0 object |
| `app.mjs` (modify) | Mount Swagger UI at `/api-docs` |
| `package.json` (modify via npm) | Add `swagger-ui-express` dependency |
| `README.md` (modify) | Note docs URL |

---

### Task 1: Install `swagger-ui-express`

**Files:**
- Modify: `package.json`, `package-lock.json` (via npm)

**Interfaces:**
- Consumes: none
- Produces: `swagger-ui-express` installed and importable as default export

- [ ] **Step 1: Install the package**

Run:

```bash
npm install swagger-ui-express
```

Expected: exit code 0; `package.json` lists `"swagger-ui-express"` under `dependencies`.

- [ ] **Step 2: Confirm import works**

Run:

```bash
node -e "import('swagger-ui-express').then(m => console.log(typeof m.default.serve, typeof m.default.setup))"
```

Expected: prints `object function` (or `function function` depending on version; both `serve` and `setup` must be defined).

---

### Task 2: Create `swagger.mjs` OpenAPI spec

**Files:**
- Create: `swagger.mjs`

**Interfaces:**
- Consumes: none
- Produces: `export default swaggerSpec` — OpenAPI 3.0 object with tags Health, Questions, Answers and all 12 endpoints from the spec

- [ ] **Step 1: Create `swagger.mjs` with the full spec**

Create file `swagger.mjs` at the project root with exactly this content:

```js
const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Quora-like Q&A API",
    version: "1.0.0",
    description:
      "RESTful API for creating and managing questions, answers, and votes.",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Health", description: "Server health check" },
    { name: "Questions", description: "Question CRUD, search, and voting" },
    { name: "Answers", description: "Answers under a question, and answer voting" },
  ],
  paths: {
    "/test": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "API is working",
            content: {
              "application/json": {
                schema: { type: "string", example: "Server API is working 🚀" },
              },
            },
          },
        },
      },
    },
    "/questions": {
      get: {
        tags: ["Questions"],
        summary: "Get all questions",
        responses: {
          200: {
            description: "List of questions",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/QuestionListResponse" },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Questions"],
        summary: "Create a question",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/QuestionInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Question created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
                example: { message: "Question created successfully." },
              },
            },
          },
          400: {
            description: "Invalid request data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/questions/search": {
      get: {
        tags: ["Questions"],
        summary: "Search questions by title and/or category",
        description: "At least one of `title` or `category` is required.",
        parameters: [
          {
            name: "title",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Title search (case-insensitive partial match)",
          },
          {
            name: "category",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Category search (case-insensitive partial match)",
          },
        ],
        responses: {
          200: {
            description: "Matching questions",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/QuestionListResponse" },
              },
            },
          },
          400: {
            description: "Missing search parameters",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { message: "Invalid search parameters." },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/questions/{questionID}": {
      get: {
        tags: ["Questions"],
        summary: "Get a question by ID",
        parameters: [
          { $ref: "#/components/parameters/questionID" },
        ],
        responses: {
          200: {
            description: "Question found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/QuestionResponse" },
              },
            },
          },
          404: {
            description: "Question not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { message: "Question not found." },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Questions"],
        summary: "Update a question",
        parameters: [
          { $ref: "#/components/parameters/questionID" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/QuestionInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Question updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
                example: { message: "Question updated successfully." },
              },
            },
          },
          400: {
            description: "Invalid request data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Question not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Questions"],
        summary: "Delete a question",
        parameters: [
          { $ref: "#/components/parameters/questionID" },
        ],
        responses: {
          200: {
            description: "Question deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
                example: {
                  message: "Question post has been deleted successfully.",
                },
              },
            },
          },
          404: {
            description: "Question not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/questions/{questionID}/vote": {
      post: {
        tags: ["Questions"],
        summary: "Vote on a question",
        parameters: [
          { $ref: "#/components/parameters/questionID" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VoteInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Vote recorded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
                example: {
                  message:
                    "Vote on the question has been recorded successfully.",
                },
              },
            },
          },
          400: {
            description: "Invalid vote value",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { message: "Invalid vote value." },
              },
            },
          },
          404: {
            description: "Question not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/questions/{questionID}/answers": {
      get: {
        tags: ["Answers"],
        summary: "Get all answers for a question",
        parameters: [
          { $ref: "#/components/parameters/questionID" },
        ],
        responses: {
          200: {
            description: "List of answers",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AnswerListResponse" },
              },
            },
          },
          404: {
            description: "Question not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Answers"],
        summary: "Create an answer",
        parameters: [
          { $ref: "#/components/parameters/questionID" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AnswerInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Answer created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
                example: { message: "Answer created successfully." },
              },
            },
          },
          400: {
            description: "Invalid request data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Question not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Answers"],
        summary: "Delete all answers for a question",
        parameters: [
          { $ref: "#/components/parameters/questionID" },
        ],
        responses: {
          200: {
            description: "Answers deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
                example: {
                  message:
                    "All answers for the question have been deleted successfully.",
                },
              },
            },
          },
          404: {
            description: "Question not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/questions/{questionID}/answers/{answerID}/vote": {
      post: {
        tags: ["Answers"],
        summary: "Vote on an answer",
        parameters: [
          { $ref: "#/components/parameters/questionID" },
          { $ref: "#/components/parameters/answerID" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VoteInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Vote recorded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
                example: {
                  message:
                    "Vote on the answer has been recorded successfully.",
                },
              },
            },
          },
          400: {
            description: "Invalid vote value",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Question or answer not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    parameters: {
      questionID: {
        name: "questionID",
        in: "path",
        required: true,
        schema: { type: "integer" },
        description: "Question ID",
      },
      answerID: {
        name: "answerID",
        in: "path",
        required: true,
        schema: { type: "integer" },
        description: "Answer ID",
      },
    },
    schemas: {
      QuestionInput: {
        type: "object",
        required: ["title", "description", "category"],
        properties: {
          title: { type: "string", example: "What is Express?" },
          description: {
            type: "string",
            example: "Explain the framework.",
          },
          category: { type: "string", example: "Node.js" },
        },
      },
      Question: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
        },
      },
      AnswerInput: {
        type: "object",
        required: ["content"],
        properties: {
          content: {
            type: "string",
            maxLength: 300,
            example: "Express is a minimal Node.js web framework.",
          },
        },
      },
      Answer: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          content: { type: "string" },
        },
      },
      VoteInput: {
        type: "object",
        required: ["vote"],
        properties: {
          vote: {
            type: "integer",
            enum: [1, -1],
            example: 1,
            description: "1 for upvote, -1 for downvote",
          },
        },
      },
      QuestionResponse: {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/Question" },
        },
      },
      QuestionListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Question" },
          },
        },
      },
      AnswerListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Answer" },
          },
        },
      },
      MessageResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
};

export default swaggerSpec;
```

- [ ] **Step 2: Verify the module loads**

Run:

```bash
node -e "import('./swagger.mjs').then(m => console.log(m.default.openapi, Object.keys(m.default.paths).length))"
```

Expected: prints `3.0.0 8` (8 path keys covering all endpoints).

---

### Task 3: Mount Swagger UI in `app.mjs`

**Files:**
- Modify: `app.mjs`

**Interfaces:**
- Consumes: `swaggerSpec` default export from `./swagger.mjs`; `swaggerUi.serve` and `swaggerUi.setup` from `swagger-ui-express`
- Produces: `GET /api-docs` serves Swagger UI HTML

- [ ] **Step 1: Update `app.mjs` to mount Swagger UI**

Replace the contents of `app.mjs` with:

```js
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.mjs";
import questionRouter from "./routes/questions.js";

const app = express();
const port = 4000;

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/questions", questionRouter);

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
```

- [ ] **Step 2: Start the server (if not already running)**

Run:

```bash
npm start
```

Expected: console shows `Server is running at 4000` (nodemon).

- [ ] **Step 3: Verify `/api-docs` returns Swagger UI**

Run (PowerShell):

```powershell
curl.exe -s -o NUL -w "%{http_code}" http://localhost:4000/api-docs/
```

Expected: `200`

Also verify HTML contains swagger:

```powershell
curl.exe -s http://localhost:4000/api-docs/ | Select-String -Pattern "swagger" -Quiet
```

Expected: `True`

- [ ] **Step 4: Verify existing health endpoint still works**

Run:

```powershell
curl.exe -s http://localhost:4000/test
```

Expected: `"Server API is working 🚀"` (JSON string).

---

### Task 4: Document the docs URL in README

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: none
- Produces: README mentions `http://localhost:4000/api-docs`

- [ ] **Step 1: Add Swagger note after the "Run the server" section**

In `README.md`, find this paragraph under "### 4. Run the server":

```markdown
The server runs on **http://localhost:4000**. Visit `GET /test` to confirm it's up.
```

Replace it with:

```markdown
The server runs on **http://localhost:4000**. Visit `GET /test` to confirm it's up.

Interactive API docs (Swagger UI) are available at **http://localhost:4000/api-docs**.
```

- [ ] **Step 2: Add `/api-docs` to the Health check table**

In the "### Health check" table, after the `/test` row, add:

```markdown
| GET    | `/api-docs` | Interactive Swagger UI documentation.                |
```

Final health table should look like:

```markdown
| Method | Endpoint | Description                                      |
| ------ | -------- | ------------------------------------------------ |
| GET    | `/test`  | Returns a message confirming the API is working. |
| GET    | `/api-docs` | Interactive Swagger UI documentation.                |
```

- [ ] **Step 3: Confirm README mentions the URL**

Run:

```powershell
Select-String -Path README.md -Pattern "api-docs"
```

Expected: at least two matching lines.

---

## Spec coverage checklist (self-review)

| Spec requirement | Task |
|------------------|------|
| Interactive UI at `/api-docs` | Task 3 |
| Single `swagger.mjs` config | Task 2 |
| `swagger-ui-express` only (no swagger-jsdoc) | Task 1 |
| All 12 endpoints documented | Task 2 |
| Schemas match API bodies/responses | Task 2 |
| Routes unchanged | Global constraint; only `app.mjs` wired |
| README docs URL | Task 4 |
| Server `http://localhost:4000` | Task 2 |
