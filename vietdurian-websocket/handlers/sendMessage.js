// handlers/sendMessage.js
const db = require("../lib/dynamo");
const { sendToUser, sendToConnection } = require("../lib/sender");

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const domainName = event.requestContext.domainName;
  const stage = event.requestContext.stage;

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { targetUserId, message, conversationId } = body;

  if (!targetUserId || !message) {
    return { statusCode: 400, body: "targetUserId and message are required" };
  }

  try {
    // Lấy thông tin sender
    const sender = await db.getConnection(connectionId);

    const payload = {
      event: "newMessage",
      data: {
        senderId: sender?.userId,
        senderName: sender?.username,
        senderAvatar: sender?.avatar,
        message,
        conversationId,
        timestamp: Date.now(),
      },
    };

    // Gửi tới người nhận
    await sendToUser(targetUserId, payload, domainName, stage);

    // Echo lại cho chính sender (để sync UI)
    await sendToConnection(
      connectionId,
      { ...payload, self: true },
      domainName,
      stage,
    );

    return { statusCode: 200, body: "Message sent" };
  } catch (err) {
    console.error("SendMessage error:", err);
    return { statusCode: 500, body: "Failed to send message" };
  }
};
