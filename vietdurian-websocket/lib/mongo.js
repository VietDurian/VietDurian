// lib/mongo.js
const { MongoClient } = require("mongodb");

let client = null;
let db = null;

const getDB = async () => {
  if (db) return db;
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db("vietdurian");
  return db;
};

const putConnection = async ({ connectionId, userId, username, avatar }) => {
  const db = await getDB();
  await db
    .collection("ws_connections")
    .replaceOne(
      { connectionId },
      { connectionId, userId, username, avatar, connectedAt: new Date() },
      { upsert: true },
    );
};

const deleteConnection = async (connectionId) => {
  const db = await getDB();
  await db.collection("ws_connections").deleteOne({ connectionId });
};

const getOnlineUserIds = async () => {
  const db = await getDB();
  const connections = await db.collection("ws_connections").find({}).toArray();
  return [...new Set(connections.map((c) => c.userId))];
};

const getAllConnections = async () => {
  const db = await getDB();
  return db.collection("ws_connections").find({}).toArray();
};

const getConnectionsByUserId = async (userId) => {
  const db = await getDB();
  return db.collection("ws_connections").find({ userId }).toArray();
};

module.exports = {
  putConnection,
  deleteConnection,
  getOnlineUserIds,
  getAllConnections,
  getConnectionsByUserId,
};
