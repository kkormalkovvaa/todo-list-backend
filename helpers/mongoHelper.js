import { MongoClient } from "mongodb";

let client = null;

async function getClient() {
  if (client) return client;

  const connectionString = process.env.MONGO_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("MONGO_CONNECTION_STRING не задан в .env файле");
  }

  const dbName = process.env.MONGO_DB_NAME;
  if (!dbName) {
    throw new Error("MONGO_DB_NAME не задан в .env файле");
  }

  client = new MongoClient(connectionString, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    maxPoolSize: 10,
  });

  try {
    await client.connect();
    console.log("✅ Подключено к MongoDB Atlas");
    return client;
  } catch (err) {
    client = null;
    console.error("❌ Ошибка подключения к MongoDB:", err.message);
    throw err;
  }
}

const mongoHelper = {
  async getDb() {
    const c = await getClient();
    return c.db(process.env.MONGO_DB_NAME);
  },

  async close() {
    if (client) {
      await client.close();
      client = null;
      console.log("🔌 Соединение с MongoDB закрыто");
    }
  },
};

export default mongoHelper;
