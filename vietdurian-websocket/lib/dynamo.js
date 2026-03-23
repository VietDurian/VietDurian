// lib/dynamo.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  GetCommand,
  ScanCommand,
  QueryCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE = process.env.CONNECTIONS_TABLE;

const db = {
  // Lưu connection khi user connect
  putConnection: async ({ connectionId, userId, username, avatar }) => {
    const ttl = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24h TTL
    await docClient.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          connectionId,
          userId,
          username,
          avatar,
          connectedAt: Date.now(),
          ttl,
        },
      }),
    );
  },

  // Xoá connection khi disconnect
  deleteConnection: async (connectionId) => {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: { connectionId },
      }),
    );
  },

  // Lấy 1 connection theo connectionId
  getConnection: async (connectionId) => {
    const res = await docClient.send(
      new GetCommand({
        TableName: TABLE,
        Key: { connectionId },
      }),
    );
    return res.Item;
  },

  // Lấy tất cả connections của 1 userId
  getConnectionsByUserId: async (userId) => {
    const res = await docClient.send(
      new QueryCommand({
        TableName: TABLE,
        IndexName: "userId-index",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
      }),
    );
    return res.Items || [];
  },

  // Lấy tất cả connections đang online
  getAllConnections: async () => {
    const res = await docClient.send(new ScanCommand({ TableName: TABLE }));
    return res.Items || [];
  },

  // Lấy danh sách userId online (unique)
  getOnlineUserIds: async () => {
    const connections = await db.getAllConnections();
    const userIds = [
      ...new Set(connections.map((c) => c.userId).filter(Boolean)),
    ];
    return userIds;
  },
};

module.exports = db;
