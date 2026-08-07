import { ObjectId } from "mongodb";
import mongoHelper from "../helpers/mongoHelper.js";

class TaskServices {
  #COLLECTION = "tasks";

  // 1. Получение всех задач пользователя по userId
  async getTasksByUserId(userId) {
    const connection = await mongoHelper.getConnection();
    const db = mongoHelper.useDefaultDb(connection);
    const data = await db
      .collection(this.#COLLECTION)
      .find({ userId })
      .toArray();
    await connection.close();
    return data;
  }

  // 2. Получение одной задачи по id (и опционально проверка, что она принадлежит пользователю)
  async getTaskById(taskId, userId = null) {
    const connection = await mongoHelper.getConnection();
    const db = mongoHelper.useDefaultDb(connection);
    const filter = { _id: new ObjectId(taskId) };

    // Если передан userId, проверяем, что задача принадлежит этому пользователю
    if (userId) {
      filter.userId = userId;
    }

    const data = await db.collection(this.#COLLECTION).findOne(filter);
    await connection.close();
    return data;
  }

  // 3. Обновление статуса done
  async updateTaskStatus(taskId, done) {
    const connection = await mongoHelper.getConnection();
    const db = mongoHelper.useDefaultDb(connection);
    const result = await db
      .collection(this.#COLLECTION)
      .updateOne(
        { _id: new ObjectId(taskId) },
        { $set: { done, updatedAt: new Date() } },
      );
    await connection.close();
    return result;
  }

  // 4. Обновление title задачи
  async updateTaskTitle(taskId, title) {
    const connection = await mongoHelper.getConnection();
    const db = mongoHelper.useDefaultDb(connection);
    const result = await db
      .collection(this.#COLLECTION)
      .updateOne(
        { _id: new ObjectId(taskId) },
        { $set: { title, updatedAt: new Date() } },
      );
    await connection.close();
    return result;
  }

  // 6. Создание новой задачи
  async createTask(taskData) {
    const connection = await mongoHelper.getConnection();
    const db = mongoHelper.useDefaultDb(connection);
    const newTask = {
      ...taskData,
      done: taskData.done || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection(this.#COLLECTION).insertOne(newTask);
    const createdTask = await db
      .collection(this.#COLLECTION)
      .findOne({ _id: result.insertedId });
    await connection.close();
    return createdTask;
  }

  // 7. Удаление одной задачи по id
  async deleteTaskById(taskId) {
    const connection = await mongoHelper.getConnection();
    const db = mongoHelper.useDefaultDb(connection);
    const result = await db
      .collection(this.#COLLECTION)
      .deleteOne({ _id: new ObjectId(taskId) });
    await connection.close();
    return result;
  }

  // 8. Удаление всех задач пользователя
  async deleteAllTasksByUserId(userId) {
    const connection = await mongoHelper.getConnection();
    const db = mongoHelper.useDefaultDb(connection);
    const result = await db.collection(this.#COLLECTION).deleteMany({ userId });
    await connection.close();
    return result; // возвращает { deletedCount: количество }
  }
}

export default new TaskServices();
