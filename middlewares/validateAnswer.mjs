const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const MAX_CONTENT_LENGTH = 300;

const validateAnswerData = (req, res, next) => {
  const { content } = req.body ?? {};

  if (content === undefined || !isNonEmptyString(content)) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return res.status(400).json({
      message: "Invalid request data. Content must be no more than 300 characters long.",
    });
  }

  return next();
};

export default validateAnswerData;
