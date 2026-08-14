import { randomUUID } from "crypto";
import mongoHelper from "../helpers/mongoHelper.js";

class UserServices {
  #COLLECTION = "users";

  async findByEmail(email) {
    const db = await mongoHelper.getDb();
    return db.collection(this.#COLLECTION).findOne({ email });
  }

  async findByUserId(userId) {
    const db = await mongoHelper.getDb();
    return db.collection(this.#COLLECTION).findOne({ userId });
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
