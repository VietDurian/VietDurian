const { reply } = require("../lib/sender");
const { chatService } = require("../services/chatService");
const db = require("../lib/mongo");

exports.handler = async (event) => {
  const { connectionId, domainName, stage } = event.requestContext;
  const authorizer = event.requestContext.authorizer;
  const { content, conversationId, receiverId } = JSON.parse(
    event.body || "{}",
  );

  try {
    const newMessage = await chatService.sendMessage(
      authorizer.userId,
      authorizer.role,
      authorizer.username,
      authorizer.avatar,
      { content, conversationId, receiverId },
    );

    // Gửi lại cho sender
    await reply(connectionId, domainName, stage, {
      event: "newMessage",
      data: newMessage,
    });

    // Push realtime cho receiver nếu đang online
    if (receiverId) {
      const receiverConnections = await db.getConnectionsByUserId(receiverId);
      const {
        ApiGatewayManagementApiClient,
        PostToConnectionCommand,
      } = require("@aws-sdk/client-apigatewaymanagementapi");
      const client = new ApiGatewayManagementApiClient({
        endpoint: `https://${domainName}/${stage}`,
      });
      await Promise.allSettled(
        receiverConnections.map((c) =>
          client.send(
            new PostToConnectionCommand({
              ConnectionId: c.connectionId,
              Data: Buffer.from(
                JSON.stringify({ event: "newMessage", data: newMessage }),
              ),
            }),
          ),
        ),
      );
    }

    return { statusCode: 200 };
  } catch (err) {
    await reply(connectionId, domainName, stage, {
      event: "error",
      action: "sendMessage",
      message: err.message,
    });
    return { statusCode: 500 };
  }
};
