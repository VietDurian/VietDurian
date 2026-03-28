const { reply } = require("../lib/sender");
const { chatService } = require("../services/chatService");

exports.handler = async (event) => {
  const { connectionId, domainName, stage } = event.requestContext;
  const user = event.requestContext.authorizer;
  const { conversationId } = JSON.parse(event.body || "{}");

  try {
    const result = await chatService.getConversationDetails(
      conversationId,
      user,
    );
    await reply(connectionId, domainName, stage, {
      event: "getConversationDetails",
      data: result,
    });
    return { statusCode: 200 };
  } catch (err) {
    await reply(connectionId, domainName, stage, {
      event: "error",
      action: "getConversationDetails",
      message: err.message,
    });
    return { statusCode: 500 };
  }
};
