import mongoHelper from "../helpers/mongoHelper.js";

class UserServices {
  #COLLECTION = "users";

  async findByEmail(email) {
    const db = await mongoHelper.getDb();
    return db.collection(this.#COLLECTION).findOne({ email });
  }

  async createUser(userData) {
    const db = await mongoHelper.getDb();
    return db.collection(this.#COLLECTION).insertOne({
      ...userData,
      createdAt: new Date(),
    });
  }

  async findById(id) {
    const db = await mongoHelper.getDb();
    return db.collection(this.#COLLECTION).findOne({ _id: id });
  }
}

export default new UserServices();
