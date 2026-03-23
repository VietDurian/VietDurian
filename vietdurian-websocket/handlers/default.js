// handlers/default.js
exports.handler = async (event) => {
  console.log("Default route hit:", event.body);
  return { statusCode: 200, body: "Unknown route" };
};
