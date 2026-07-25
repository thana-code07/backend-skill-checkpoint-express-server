const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const validateQuestionData = (req, res, next) => {
  const { title, description, category } = req.body ?? {};
  const errors = [];

  if (title === undefined) {
    errors.push("Title is required.");
  } else if (!isNonEmptyString(title)) {
    errors.push("Title must be a non-empty string.");
  }

  if (description === undefined) {
    errors.push("Description is required.");
  } else if (!isNonEmptyString(description)) {
    errors.push("Description must be a non-empty string.");
  }

  if (category === undefined) {
    errors.push("Category is required.");
  } else if (!isNonEmptyString(category)) {
    errors.push("Category must be a non-empty string.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  return next();
};

export default validateQuestionData;
