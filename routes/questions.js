import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import validateQuestionData from "../middlewares/validateQuestion.mjs";
import checkQuestionExists from "../middlewares/checkQuestionExists.mjs";
import validateVoteData from "../middlewares/validateVote.mjs";
import answerRouter from "./answers.js";

const questionRouter = Router();

questionRouter.get("/", async (req, res) => {
  try {
    const result = await connectionPool.query("select * from questions");
    return res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
});

questionRouter.get("/search", async (req, res) => {
  try {
    const { title, category } = req.query;

    if (!title && !category) {
      return res.status(400).json({ message: "Invalid search parameters." });
    }

    const result = await connectionPool.query(
      "select * from questions where title ilike $1 or category ilike $2",
      [`%${title ?? ""}%`, `%${category ?? ""}%`],
    );
    return res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to fetch a question." });
  }
});

questionRouter.get("/:questionID", async (req, res) => {
  try {
    const id = req.params.questionID;
    const result = await connectionPool.query(
      "select * from questions where id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
});

questionRouter.post("/", validateQuestionData, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const result = await connectionPool.query(
      "insert into questions(title, description, category) values($1, $2, $3)",
      [title, description, category],
    );
    return res.status(201).json({ message: "Question created successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to create question." });
  }
});

questionRouter.put("/:questionID", validateQuestionData, async (req, res) => {
  try {
    const id = req.params.questionID;
    const { title, description, category } = req.body;
    const result = await connectionPool.query(
      "update questions set title = $1, description = $2, category = $3 where id = $4 returning *",
      [title, description, category, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res.status(200).json({ message: "Question updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
});

questionRouter.delete("/:questionID", async (req, res) => {
  try {
    const id = req.params.questionID;
    const result = await connectionPool.query(
      "delete from questions where id = $1 returning *",
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res
      .status(200)
      .json({ message: "Question post has been deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to delete question." });
  }
});

questionRouter.post(
  "/:questionID/vote",
  checkQuestionExists,
  validateVoteData,
  async (req, res) => {
    try {
      const id = req.params.questionID;
      const { vote } = req.body;
      await connectionPool.query(
        "insert into question_votes(question_id, vote) values($1, $2)",
        [id, vote],
      );
      return res.status(200).json({
        message: "Vote on the question has been recorded successfully.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Unable to vote question." });
    }
  },
);

questionRouter.use("/:questionID/answers", checkQuestionExists, answerRouter);

export default questionRouter;
