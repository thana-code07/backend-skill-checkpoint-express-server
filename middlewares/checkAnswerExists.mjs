import connectionPool from "../utils/db.mjs";

const checkAnswerExists = async (req, res, next) => {
  try {
    const answerId = req.params.answerID;
    const questionId = req.params.questionID;
    const result = await connectionPool.query(
      "select id from answers where id = $1 and question_id = $2",
      [answerId, questionId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Answer not found." });
    }

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to fetch answers." });
  }
};

export default checkAnswerExists;
