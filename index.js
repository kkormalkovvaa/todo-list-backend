import express from "express";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import jwt from "jsonwebtoken";
import {
  taskId,
  validateCreateTask,
  validateReplaceTask,
  validateGetTasks,
  handleValidationErrors,
} from "./validators.js";
import { error } from "console";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./swagger.js";

const SECRET = "access-secret";
const TOKEN_TTL = "1h";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

console.log("dir", __dirname);
const DB = path.join(__dirname, "db.json");

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const data = await fs.readFile(DB);
  const db = JSON.parse(data);

  const user = {
    id: randomUUID(),
    email,
    passwordHash: await bcrypt.hash(password, 10),
  };

  db.users.push(user);
  await fs.writeFile(DB, JSON.stringify(db, null, 2), { flag: "w" });

  res.status(201).json({ id: user.id, email: user.email });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const data = await fs.readFile(DB);
  const db = JSON.parse(data);

  const user = db.users.find((user) => user.email === email);
  const pass = await bcrypt.compare(password, user.passwordHash);

  if (!user || !pass) {
    res.status(401).send("Неверный email или password");
  }

  res.json({ token: signToken(user) });
});

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, SECRET, {
    expiresIn: TOKEN_TTL,
  });
}

function auth(req, res, next) {
  const [scheme, token] = req.headers.authorization.split(" ");

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

app.get("/createFile", async (req, res) => {
  try {
    await fs.writeFile(DB, JSON.stringify([], null, 2), { flag: "wx" });
    res.send("Создал!");
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Ошибка сервера");
  }
});

app.get("/readFile", async (req, res) => {
  try {
    try {
      await fs.access(DB);
    } catch (err) {
      res.status(404).send("Файл не найден");
    }
    await fs.readFile(DB);
  } catch (err) {
    res.status(500).send("Ошибка сервера");
  }
});

app.post(
  "/createTask",
  auth,
  validateCreateTask,
  handleValidationErrors,
  async (req, res) => {
    try {
      await fs.access(DB);
    } catch (err) {
      res.status(404).send("Файл не найден");
    }
    const row = await fs.readFile(DB, "utf-8");
    const db = JSON.parse(row);

    const newTask = {
      userId: req.user.id,
      id: db.tasks.length
        ? Math.max(...db.tasks.map((item) => item.id)) + 1
        : 1,
      title: req.body.title,
      done: false,
      createdAt: new Date(),
    };

    db.tasks.push(newTask);

    try {
      await fs.writeFile(DB, JSON.stringify(db, null, 2));

      res.send("Таска добавлена!");
    } catch (error) {
      next(error);
    }
  },
);

app.get(
  "/readTasks/user/:userId",
  handleValidationErrors,
  async (req, res, next) => {
    try {
      await fs.access(DB);
    } catch (err) {
      res.status(404).send("Файл не найден");
    }

    const row = await fs.readFile(DB, "utf-8");
    const db = JSON.parse(row);
    try {
      const userTasks = db.tasks.filter(
        (task) => task.userId === req.params.userId,
      );

      if (userTasks == 0) {
        return res
          .status(404)
          .send("Для вашего пользователя задачи не найдены");
      }

      res.json(userTasks);
    } catch (err) {
      next(error);
      // res.status(500).send("Ошибка сервера");
    }
  },
);

app.get(
  "/readTask/:id",
  taskId(),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      await fs.access(DB);
    } catch (err) {
      res.status(404).send("Файл не найден");
    }
    const row = await fs.readFile(DB, "utf-8");
    const db = JSON.parse(row);

    try {
      const task = db.tasks.find((task) => task.id == req.params.id);

      if (!task) return res.status(404).send("Таска не найдена");

      console.log("task - ", task);
      res.send("Таска найдена!");
    } catch (error) {
      next(error);
    }
  },
);

app.patch(
  "/updateDone/:id",
  auth,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      await fs.access(DB);
    } catch (err) {
      res.status(404).send("Файл не найден");
    }
    const id = req.params.id;
    const row = await fs.readFile(DB, "utf-8");
    const db = JSON.parse(row);

    try {
      const taskIndex = db.tasks.findIndex((task) => task.id == id);

      if (taskIndex === -1) {
        return res.status(404).send("Таска не найдена");
      }

      if (db.tasks[taskIndex].userId !== req.user.id) {
        return res.status(403).send("Нет прав на изменение этой задачи");
      }

      db.tasks[taskIndex].done = !db.tasks[taskIndex].done;

      await fs.writeFile(DB, JSON.stringify(db, null, 2));
      console.log(db.tasks[taskIndex]);
      res.send("Таска изменена!");
    } catch (error) {
      next(error);
    }
  },
);

app.put(
  "/updateTitle/:id",
  auth,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      try {
        await fs.access(DB);
      } catch (err) {
        res.status(404).send("Файл не найден");
      }
      const { newTitle } = req.body;
      const id = req.params.id;
      const row = await fs.readFile(DB, "utf-8");
      const db = JSON.parse(row);

      const taskIndex = db.tasks.findIndex((task) => task.id == id);

      if (taskIndex === -1) {
        return res.status(404).send("Таска не найдена");
      }

      if (db.tasks[taskIndex].userId !== req.user.id) {
        return res.status(403).send("Нет прав на изменение этой задачи");
      }

      db.tasks[taskIndex].title = newTitle;
      await fs.writeFile(DB, JSON.stringify(db, null, 2));

      console.log(db.tasks[taskIndex]);
      res.send("Тайтл таски изменен");
    } catch (err) {
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
      await fs.access(DB);
    } catch (err) {
      res.status(404).send("Файл не найден");
    }

    const row = await fs.readFile(DB, "utf-8");
    const db = JSON.parse(row);

    const taskIndex = db.tasks.findIndex((task) => task.id == req.params.id);

    if (taskIndex == -1) {
      return res.status(404).send("Задача с таким ID не найдена");
    }

    if (db.tasks[taskIndex].userId !== req.user.id) {
      return res.status(403).send("Нет прав на удаление этой задачи");
    }

    db.tasks.splice(taskIndex, 1);
    try {
      await fs.writeFile(DB, JSON.stringify(db, null, 2));
      res.send("Таска удалена!");
    } catch (err) {
      next(err);
    }
  },
);

app.delete("/deleteFile", async (req, res) => {
  try {
    try {
      await fs.access(DB);
    } catch (err) {
      res.status(404).send("Такой файл не найден!");
    }

    await fs.unlink(DB);
    res.send("Файл db.json удален");
  } catch (err) {}
});

app.listen(5000, () => {
  console.log("Старт");
});

// get — только свои таски получить
// post — создание в свои таски (добавить userId)
// patch — изменение title толкьо своей таски
// patch — done толкьо своей таски
// delete — удаление толкьо своей таски
