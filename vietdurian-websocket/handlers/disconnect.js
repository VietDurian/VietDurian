// handlers/disconnect.js
const db = require("../lib/dynamo");
const { broadcast } = require("../lib/sender");

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const domainName = event.requestContext.domainName;
  const stage = event.requestContext.stage;

  try {
    await db.deleteConnection(connectionId);

    // Broadcast lại danh sách online users sau khi 1 user disconnect
    const onlineUserIds = await db.getOnlineUserIds();
    await broadcast(
      { event: "getOnlineUsers", data: onlineUserIds },
      domainName,
      stage,
    );

    return { statusCode: 200, body: "Disconnected" };
  } catch (err) {
    console.error("Disconnect error:", err);
    return { statusCode: 500, body: "Failed to disconnect" };
  }
};
