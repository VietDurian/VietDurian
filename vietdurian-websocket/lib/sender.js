// lib/sender.js
const {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
  DeleteConnectionCommand,
} = require("@aws-sdk/client-apigatewaymanagementapi");
const db = require("./dynamo");

const getClient = (domainName, stage) => {
  const endpoint = `https://${domainName}/${stage}`;
  return new ApiGatewayManagementApiClient({ endpoint });
};

// Gửi message tới 1 connectionId
const sendToConnection = async (connectionId, data, domainName, stage) => {
  const client = getClient(domainName, stage);
  try {
    await client.send(
      new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: JSON.stringify(data),
      }),
    );
    return true;
  } catch (err) {
    if (err.$metadata?.httpStatusCode === 410) {
      // Connection đã stale → xoá khỏi DB
      await db.deleteConnection(connectionId);
    }
    return false;
  }
};

// Gửi tới tất cả connections của 1 userId
const sendToUser = async (userId, data, domainName, stage) => {
  const connections = await db.getConnectionsByUserId(userId);
  await Promise.all(
    connections.map((c) =>
      sendToConnection(c.connectionId, data, domainName, stage),
    ),
  );
};

// Broadcast tới tất cả connections đang online
const broadcast = async (
  data,
  domainName,
  stage,
  excludeConnectionId = null,
) => {
  const connections = await db.getAllConnections();
  await Promise.all(
    connections
      .filter((c) => c.connectionId !== excludeConnectionId)
      .map((c) => sendToConnection(c.connectionId, data, domainName, stage)),
  );
};

module.exports = { sendToConnection, sendToUser, broadcast };
