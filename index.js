import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  taskId,
  validateCreateTask,
  validateReplaceTask,
  validateGetTasks,
  handleValidationErrors,
} from "./validators.js";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./swagger.js";
import UserServices from "./services/UserServices.js";
import TaskServices from "./services/TaskServices.js";

dotenv.config();

const SECRET = "access-secret";
const TOKEN_TTL = "1h";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

function signToken(user) {
  return jwt.sign({ id: user._id.toString(), email: user.email }, SECRET, {
    expiresIn: TOKEN_TTL,
  });
}

function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Токен не предоставлен" });
  }

  const [scheme, token] = authHeader.split(" ");

  try {
    req.user = jwt.verify(token, SECRET, { algorithms: ["HS256"] });
    next();
  } catch (err) {
    const expired = err.name === "TokenExpiredError";
    res
      .status(401)
      .json({ error: expired ? "Токен истек" : "Токен невалиден" });
  }
}

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email и пароль обязательны" });
  }

  try {
    const existingUser = await UserServices.findByEmail(email);
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Пользователь с таким email уже существует" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await UserServices.createUser({ email, passwordHash });
    const user = await UserServices.findByEmail(email);

    res.status(201).json({
      token: signToken(user),
      user: { id: result.insertedId, email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserServices.findByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const pass = await bcrypt.compare(password, user.passwordHash);
    if (!pass) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    res.json({
      token: signToken(user),
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.post(
  "/createTask",
  auth,
  validateCreateTask,
  handleValidationErrors,
  async (req, res) => {
    try {
      const newTask = {
        userId: req.user.id,
        title: req.body.title,
        description: req.body.description,
        done: false,
      };

      const task = await TaskServices.createTask(newTask);
      res.status(201).json(task);
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
);

app.get(
  "/readTasks/user/:userId",
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const tasks = await TaskServices.getTasksByUserId(req.params.userId);
      res.json(tasks);
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
);

app.get(
  "/readTask/:id",
  taskId(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const task = await TaskServices.getTaskById(req.params.id);

      if (!task) {
        return res.status(404).json({ error: "Таска не найдена" });
      }

      res.json(task);
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
);

app.patch("/updateDone/:id", auth, async (req, res, next) => {
  try {
    const task = await TaskServices.getTaskById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Таска не найдена" });
    }

    if (task.userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Нет прав на изменение этой задачи" });
    }

    const newDoneStatus = !task.done;
    await TaskServices.updateTaskStatus(req.params.id, newDoneStatus);

    res.json({ message: "Статус задачи изменён", done: newDoneStatus });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

app.put(
  "/updateTitle/:id",
  auth,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { newTitle } = req.body;

      if (!newTitle) {
        return res.status(400).json({ error: "Поле newTitle обязательно" });
      }

      const task = await TaskServices.getTaskById(req.params.id);

      if (!task) {
        return res.status(404).json({ error: "Таска не найдена" });
      }

      if (task.userId !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Нет прав на изменение этой задачи" });
      }

      await TaskServices.updateTaskTitle(req.params.id, newTitle);

      res.json({ message: "Тайтл таски изменен", title: newTitle });
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
);

app.delete(
  "/deleteTask/:id",
  auth,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const task = await TaskServices.getTaskById(req.params.id);

      if (!task) {
        return res.status(404).json({ error: "Таска не найдена" });
      }

      if (task.userId !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Нет прав на удаление этой задачи" });
      }

      await TaskServices.deleteTaskById(req.params.id);

      res.json({ message: "Таска удалена!" });
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
);

app.delete("/deleteAllTasks/user/:userId", auth, async (req, res, next) => {
  try {
    if (req.params.userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Нет прав на удаление задач этого пользователя" });
    }

    const result = await TaskServices.deleteAllTasksByUserId(req.params.userId);
    res.json({ message: `Удалено задач: ${result.deletedCount}` });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

app.listen(5000, () => {
  console.log("Старт");
});
