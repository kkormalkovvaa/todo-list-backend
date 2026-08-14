import { ObjectId } from "mongodb";
import mongoHelper from "../helpers/mongoHelper.js";

class TaskServices {
  #COLLECTION = "tasks";

  async getTasksByUserId(userId) {
    const db = await mongoHelper.getDb();
    return db.collection(this.#COLLECTION).find({ userId }).toArray();
  }

  async getTaskById(taskId, userId = null) {
    const db = await mongoHelper.getDb();
    const filter = { _id: new ObjectId(taskId) };
    if (userId) filter.userId = userId;
    return db.collection(this.#COLLECTION).findOne(filter);
  }

  async updateTaskStatus(taskId, done) {
    const db = await mongoHelper.getDb();
    return db
      .collection(this.#COLLECTION)
      .updateOne(
        { _id: new ObjectId(taskId) },
        { $set: { done, updatedAt: new Date() } },
      );
  }

  async updateTaskTitle(taskId, title) {
    const db = await mongoHelper.getDb();
    return db
      .collection(this.#COLLECTION)
      .updateOne(
        { _id: new ObjectId(taskId) },
        { $set: { title, updatedAt: new Date() } },
      );
  }

  async createTask(taskData) {
    const db = await mongoHelper.getDb();
    const newTask = {
      ...taskData,
      done: taskData.done || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection(this.#COLLECTION).insertOne(newTask);
    return db.collection(this.#COLLECTION).findOne({ _id: result.insertedId });
  }

  async deleteTaskById(taskId) {
    const db = await mongoHelper.getDb();
    return db
      .collection(this.#COLLECTION)
      .deleteOne({ _id: new ObjectId(taskId) });
  }

  async deleteAllTasksByUserId(userId) {
    const db = await mongoHelper.getDb();
    return db.collection(this.#COLLECTION).deleteMany({ userId });
  }
}

export default new TaskServices();
