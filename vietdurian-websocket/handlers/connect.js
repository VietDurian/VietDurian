// handlers/connect.js
const db = require("../lib/dynamo");
const { broadcast } = require("../lib/sender");

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const domainName = event.requestContext.domainName;
  const stage = event.requestContext.stage;

  // Lấy từ authorizer context
  const userId = event.requestContext.authorizer?.userId;
  const username = event.requestContext.authorizer?.username || "";
  const avatar = event.requestContext.authorizer?.avatar || "";

  try {
    await db.putConnection({ connectionId, userId, username, avatar });

    // Broadcast danh sách online users mới cho tất cả
    const onlineUserIds = await db.getOnlineUserIds();
    await broadcast(
      { event: "getOnlineUsers", data: onlineUserIds },
      domainName,
      stage,
    );

    return { statusCode: 200, body: "Connected" };
  } catch (err) {
    console.error("Connect error:", err);
    return { statusCode: 500, body: "Failed to connect" };
  }
};
