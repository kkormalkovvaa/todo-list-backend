import { MongoClient } from "mongodb";

const mongoHelper = {
  async getConnection() {
    const connectionString = process.env.MONGO_CONNECTION_STRING;

    if (!connectionString) {
      throw new Error("MONGO_CONNECTION_STRING не задан в .env файле");
    }

    try {
      const client = new MongoClient(connectionString, {
        serverSelectionTimeoutMS: 5000, // 5 секунд на подключение
        connectTimeoutMS: 5000, // 5 секунд на установку соединения
      });
      await client.connect();
      return client;
    } catch (error) {
      console.error("❌ Ошибка подключения к MongoDB:", error.message);
      throw error;
    }
  },
  useDefaultDb(connection) {
    const dbName = process.env.MONGO_DB_NAME;

    if (!dbName) {
      throw new Error("MONGO_DB_NAME не задан в .env файле");
    }

    return connection.db(dbName);
  },

  async closeConnection(connection) {
    if (connection) {
      try {
        await connection.close();
        console.log("🔌 Соединение с MongoDB закрыто");
      } catch (error) {
        console.error("❌ Ошибка при закрытии соединения:", error.message);
      }
    }
  },
};

export default mongoHelper;
