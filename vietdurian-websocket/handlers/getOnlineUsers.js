// handlers/getOnlineUsers.js
const db = require("../lib/dynamo");
const { sendToConnection } = require("../lib/sender");

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const domainName = event.requestContext.domainName;
  const stage = event.requestContext.stage;

  try {
    const onlineUserIds = await db.getOnlineUserIds();

    await sendToConnection(
      connectionId,
      { event: "getOnlineUsers", data: onlineUserIds },
      domainName,
      stage,
    );

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("GetOnlineUsers error:", err);
    return { statusCode: 500, body: "Failed" };
  }
};
