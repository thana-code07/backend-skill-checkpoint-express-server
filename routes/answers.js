import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import validateAnswerData from "../middlewares/validateAnswer.mjs";
import validateVoteData from "../middlewares/validateVote.mjs";
import checkAnswerExists from "../middlewares/checkAnswerExists.mjs";

const answerRouter = Router({ mergeParams: true });

answerRouter.get("/", async (req, res) => {
  try {
    const id = req.params.questionID;
    const result = await connectionPool.query(
      "select id, content from answers where question_id = $1",
      [id],
    );
    return res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to fetch answers." });
  }
});

answerRouter.post("/", validateAnswerData, async (req, res) => {
  try {
    const id = req.params.questionID;
    const { content } = req.body;
    await connectionPool.query(
      "insert into answers(question_id, content) values($1, $2)",
      [id, content],
    );
    return res.status(201).json({ message: "Answer created successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to create answers." });
  }
});

answerRouter.delete("/", async (req, res) => {
  try {
    const id = req.params.questionID;
    await connectionPool.query("delete from answers where question_id = $1", [
      id,
    ]);
    return res.status(200).json({
      message: "All answers for the question have been deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to delete answers." });
  }
});

answerRouter.post(
  "/:answerID/vote",
  checkAnswerExists,
  validateVoteData,
  async (req, res) => {
    try {
      const id = req.params.answerID;
      const { vote } = req.body;
      await connectionPool.query(
        "insert into answer_votes(answer_id, vote) values($1, $2)",
        [id, vote],
      );
      return res.status(200).json({
        message: "Vote on the answer has been recorded successfully.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Unable to vote answer." });
    }
  },
);

export default answerRouter;
