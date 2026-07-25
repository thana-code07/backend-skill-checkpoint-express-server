import connectionPool from "../utils/db.mjs";

const checkQuestionExists = async (req, res, next) => {
  try {
    const id = req.params.questionID;
    const result = await connectionPool.query(
      "select id from questions where id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
};

export default checkQuestionExists;
