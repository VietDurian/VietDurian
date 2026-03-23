// handlers/authorizer.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

exports.handler = async (event) => {
  try {
    const token =
      event.queryStringParameters?.token ||
      event.headers?.Authorization?.replace("Bearer ", "");

    if (!token) {
      return generatePolicy("anonymous", "Deny", event.methodArn);
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    return {
      ...generatePolicy(
        decoded.userId || decoded._id || decoded.id,
        "Allow",
        event.methodArn,
      ),
      context: {
        userId: String(decoded.userId || decoded._id || decoded.id),
        username: String(decoded.username || decoded.name || ""),
        avatar: String(decoded.avatar || ""),
      },
    };
  } catch (err) {
    console.error("Authorizer error:", err.message);
    return generatePolicy("anonymous", "Deny", event.methodArn);
  }
};

const generatePolicy = (principalId, effect, resource) => ({
  principalId,
  policyDocument: {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: resource,
      },
    ],
  },
});
