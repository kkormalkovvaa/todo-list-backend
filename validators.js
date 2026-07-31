// const { body, param, query, validationResult } = require("express-validator");
import { body, param, query, validationResult } from "express-validator";

function taskId() {
  return param("id")
    .isInt({ min: 1 })
    .withMessage("id должен быть положительным целым числом.")
    .toInt();
}

function title({ optional = false } = {}) {
  const validator = body("title").trim();

  if (optional) validator.optional();

  return validator
    .notEmpty()
    .withMessage("title обязателен.")
    .isLength({ min: 3, max: 100 })
    .withMessage("title должен содержать от 3 до 100 символов.");
}

function description() {
  return body("description")
    .optional()
    .isString()
    .withMessage("description должен быть строкой.")
    .trim()
    .isLength({ max: 500 })
    .withMessage("description не должен превышать 500 символов.");
}

function completed() {
  return body("completed")
    .optional()
    .isBoolean()
    .withMessage("completed должен быть true или false.")
    .toBoolean();
}

const validateCreateTask = [title(), description(), completed()];

const validateReplaceTask = [taskId(), title(), description(), completed()];

const validatePatchTask = [
  taskId(),
  body().custom((value, { req }) => {
    const allowedFields = ["title", "description", "completed"];
    const suppliedFields = Object.keys(req.body);

    if (suppliedFields.length === 0) {
      throw new Error("Передайте хотя бы одно поле для обновления.");
    }

    if (suppliedFields.some((field) => !allowedFields.includes(field))) {
      throw new Error(`Разрешены только поля: ${allowedFields.join(", ")}.`);
    }

    return true;
  }),
  title({ optional: true }),
  description(),
  completed(),
];

const validateGetTasks = [
  query("completed")
    .optional()
    .isBoolean()
    .withMessage("completed в query должен быть true или false.")
    .toBoolean(),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Ошибка валидации.",
      errors: errors.array().map(({ type, value, msg, path, location }) => ({
        type,
        value,
        message: msg,
        field: path,
        location,
      })),
    });
  }

  next();
}

export {
  taskId,
  validateCreateTask,
  validateReplaceTask,
  validateGetTasks,
  handleValidationErrors,
};
