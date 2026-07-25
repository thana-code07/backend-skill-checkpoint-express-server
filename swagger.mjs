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
        description:
          "At least one of `title` or `category` is required. When both are provided, filters are combined with OR (a row matches if either filter matches). An omitted or blank parameter is treated as a broad match (`ilike '%%'`) and does not narrow results.",
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
