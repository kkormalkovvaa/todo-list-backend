import { randomUUID } from "crypto";
import mongoHelper from "../helpers/mongoHelper.js";

class UserServices {
  #COLLECTION = "users";
  #PROJECTION = { _id: 0, passwordHash: 0 };

  async findByEmail(email) {
    const db = await mongoHelper.getDb();
    return db
      .collection(this.#COLLECTION)
      .findOne({ email }, { projection: this.#PROJECTION });
  }

  async findByUserId(userId) {
    const db = await mongoHelper.getDb();
    return db
      .collection(this.#COLLECTION)
      .findOne({ userId }, { projection: this.#PROJECTION });
  }

  async createUser(userData) {
    const db = await mongoHelper.getDb();
    const userId = randomUUID();
    await db.collection(this.#COLLECTION).insertOne({
      ...userData,
      userId,
      createdAt: new Date(),
    });
    return userId;
  }
}

export default new UserServices();
