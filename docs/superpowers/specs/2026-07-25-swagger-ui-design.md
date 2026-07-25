# Swagger UI Design — Quora-like Q&A API

**Date:** 2026-07-25  
**Status:** Approved (pending final review)

## Goal

Add interactive API documentation via Swagger UI at `/api-docs`, so developers can browse and try all existing endpoints without changing route behavior.

## Decisions

| Decision | Choice |
|----------|--------|
| Scope | Interactive UI only (no standalone OpenAPI YAML export requirement) |
| UI path | `/api-docs` |
| Spec style | Single config file (`swagger.mjs`) — not JSDoc on routes |
| Approach | `swagger-ui-express` + plain OpenAPI 3.0 JS object |

## Architecture

```
app.mjs
  ├── express.json()
  ├── /api-docs  → swagger-ui-express (swaggerSpec from swagger.mjs)
  ├── /questions → questionRouter (unchanged)
  └── /test      → health check (unchanged)

swagger.mjs
  └── OpenAPI 3.0 definition (info, servers, tags, paths, components)
```

- Routes stay free of Swagger annotations.
- Spec is the source of truth for docs; it must mirror current request/response shapes and status codes.

## Dependencies

- `swagger-ui-express` — serves the interactive UI

No `swagger-jsdoc` (not needed when using a plain JS OpenAPI object).

## Spec contents (`swagger.mjs`)

### Info & server

- Title: Quora-like Q&A API (or similar)
- Version: `1.0.0`
- Server: `http://localhost:4000`

### Tags

- `Health`
- `Questions`
- `Answers`

### Endpoints to document

| Method | Path | Tag |
|--------|------|-----|
| GET | `/test` | Health |
| GET | `/questions` | Questions |
| GET | `/questions/search` | Questions |
| GET | `/questions/{questionID}` | Questions |
| POST | `/questions` | Questions |
| PUT | `/questions/{questionID}` | Questions |
| DELETE | `/questions/{questionID}` | Questions |
| POST | `/questions/{questionID}/vote` | Questions |
| GET | `/questions/{questionID}/answers` | Answers |
| POST | `/questions/{questionID}/answers` | Answers |
| DELETE | `/questions/{questionID}/answers` | Answers |
| POST | `/questions/{questionID}/answers/{answerID}/vote` | Answers |

### Schemas (match existing API)

- **QuestionInput:** `{ title, description, category }` — all required non-empty strings
- **Question:** `{ id, title, description, category }`
- **AnswerInput:** `{ content }` — required, max 300 chars
- **Answer:** `{ id, content }`
- **VoteInput:** `{ vote }` — enum `1` | `-1`
- **DataResponse / MessageResponse:** `{ data }` / `{ message }`
- **ErrorResponse:** `{ message }`

Document typical status codes used today: `200`, `201`, `400`, `404`, `500`.

## App integration

In `app.mjs`:

1. Import `swagger-ui-express` and `swaggerSpec` from `./swagger.mjs`
2. Mount: `app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))`
3. Keep existing routers and `/test` as-is

## README

Add a short note that interactive docs are at `http://localhost:4000/api-docs`.

## Out of scope

- Separate `openapi.yaml` file
- Auth / security schemes (API has none today)
- Changing validation, routes, or response formats
- Auto-generating the spec from code

## Success criteria

1. `npm start` serves Swagger UI at `http://localhost:4000/api-docs`
2. All listed endpoints appear with correct methods, params, and example bodies
3. "Try it out" can call the live local server
4. Existing route files are unchanged except any unavoidable import/wiring (wiring only in `app.mjs`)
