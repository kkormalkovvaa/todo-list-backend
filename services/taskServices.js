import mongoHelper from "../helpers/mongoHelper.js";

class TaskServices {
  #COLLECTION = "tasks";
  #COUNTERS = "counters";
  #PROJECTION = { _id: 0 };

  async #getNextId() {
    const db = await mongoHelper.getDb();
    const result = await db
      .collection(this.#COUNTERS)
      .findOneAndUpdate(
        { _id: "taskId" },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" },
      );
    return result.seq;
  }

  async getTasksByUserId(userId) {
    const db = await mongoHelper.getDb();
    return db
      .collection(this.#COLLECTION)
      .find({ userId }, { projection: this.#PROJECTION })
      .toArray();
  }

  async getTaskById(taskId) {
    const db = await mongoHelper.getDb();
    return db
      .collection(this.#COLLECTION)
      .findOne({ id: Number(taskId) }, { projection: this.#PROJECTION });
  }

  async updateTaskStatus(taskId, done) {
    const db = await mongoHelper.getDb();
    return db
      .collection(this.#COLLECTION)
      .updateOne(
        { id: Number(taskId) },
        { $set: { done, updatedAt: new Date() } },
      );
  }

  async updateTaskTitle(taskId, title) {
    const db = await mongoHelper.getDb();
    return db
      .collection(this.#COLLECTION)
      .updateOne(
        { id: Number(taskId) },
        { $set: { title, updatedAt: new Date() } },
      );
  }

  async createTask(taskData) {
    const db = await mongoHelper.getDb();
    const id = await this.#getNextId();
    const newTask = {
      id,
      ...taskData,
      done: taskData.done || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection(this.#COLLECTION).insertOne(newTask);
    const { _id, ...task } = newTask;
    return task;
  }

  async deleteTaskById(taskId) {
    const db = await mongoHelper.getDb();
    return db.collection(this.#COLLECTION).deleteOne({ id: Number(taskId) });
  }

  async deleteAllTasksByUserId(userId) {
    const db = await mongoHelper.getDb();
    return db.collection(this.#COLLECTION).deleteMany({ userId });
  }
}

export default new TaskServices();
