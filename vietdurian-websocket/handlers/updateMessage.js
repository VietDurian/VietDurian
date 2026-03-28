const { reply } = require("../lib/sender");
const { chatService } = require("../services/chatService");

exports.handler = async (event) => {
  const { connectionId, domainName, stage } = event.requestContext;
  const userId = event.requestContext.authorizer?.userId;
  const { messageId, content, recall } = JSON.parse(event.body || "{}");

  try {
    const updated = await chatService.updateMessage(messageId, userId, {
      content,
      recall,
    });
    await reply(connectionId, domainName, stage, {
      event: "messageUpdated",
      data: updated,
    });
    return { statusCode: 200 };
  } catch (err) {
    await reply(connectionId, domainName, stage, {
      event: "error",
      action: "updateMessage",
      message: err.message,
    });
    return { statusCode: 500 };
  }
};
