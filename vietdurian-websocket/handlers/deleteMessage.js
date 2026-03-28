const { reply } = require("../lib/sender");
const { chatService } = require("../services/chatService");

exports.handler = async (event) => {
  const { connectionId, domainName, stage } = event.requestContext;
  const userId = event.requestContext.authorizer?.userId;
  const { messageId } = JSON.parse(event.body || "{}");

  try {
    const result = await chatService.deleteMessage(messageId, userId);
    await reply(connectionId, domainName, stage, {
      event: "messageDeleted",
      data: result,
    });
    return { statusCode: 200 };
  } catch (err) {
    await reply(connectionId, domainName, stage, {
      event: "error",
      action: "deleteMessage",
      message: err.message,
    });
    return { statusCode: 500 };
  }
};
