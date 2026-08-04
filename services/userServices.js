// services/UserServices.js
import mongoHelper from "../helpers/mongoHelper.js";

class UserServices {
  #COLLECTION = "users";

  async findByEmail(email) {
    const connection = await mongoHelper.getConnection();
    const db = mongoHelper.useDefaultDb(connection);
    const user = await db.collection(this.#COLLECTION).findOne({ email });
    await connection.close();
    return user;
  }

  async createUser(userData) {
    const connection = await mongoHelper.getConnection();
    const db = mongoHelper.useDefaultDb(connection);
    const result = await db.collection(this.#COLLECTION).insertOne({
      ...userData,
      createdAt: new Date(),
    });
    await connection.close();
    return result;
  }

  async findById(id) {
    const connection = await mongoHelper.getConnection();
    const db = mongoHelper.useDefaultDb(connection);
    const user = await db.collection(this.#COLLECTION).findOne({ _id: id });
    await connection.close();
    return user;
  }
}

export default new UserServices();
