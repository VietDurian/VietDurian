// lib/sender.js
const {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} = require("@aws-sdk/client-apigatewaymanagementapi");

const getClient = (domainName, stage) =>
  new ApiGatewayManagementApiClient({
    endpoint: `https://${domainName}/${stage}`,
  });

// Gửi về đúng connectionId
const reply = async (connectionId, domainName, stage, payload) => {
  const client = getClient(domainName, stage);
  await client.send(
    new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: Buffer.from(JSON.stringify(payload)),
    }),
  );
};

// Broadcast tất cả connections
const broadcast = async (payload, domainName, stage) => {
  const db = require("./mongo");
  const connections = await db.getAllConnections();
  const client = getClient(domainName, stage);

  await Promise.allSettled(
    connections.map((c) =>
      client.send(
        new PostToConnectionCommand({
          ConnectionId: c.connectionId,
          Data: Buffer.from(JSON.stringify(payload)),
        }),
      ),
    ),
  );
};

module.exports = { reply, broadcast };
