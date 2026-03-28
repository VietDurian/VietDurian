const db = require("../lib/mongo");
const { reply } = require("../lib/sender");
const { chatService } = require("../services/chatService");

exports.handler = async (event) => {
  const { connectionId, domainName, stage } = event.requestContext;
  const userId = event.requestContext.authorizer?.userId;

  try {
    const conversations = await chatService.getUserConversations(userId);
    await reply(connectionId, domainName, stage, {
      event: "getUserConversations",
      data: conversations,
    });
    return { statusCode: 200 };
  } catch (err) {
    await reply(connectionId, domainName, stage, {
      event: "error",
      action: "getUserConversations",
      message: err.message,
    });
    return { statusCode: 500 };
  }
};
