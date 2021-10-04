/*global require exports  */
const { sendResponse } = require("../../utils/lambda");

/**
 * CORS Handler - options - /
 * @param {import("aws-lambda").APIGatewayProxyEvent} event
 * @param {import("aws-lambda").Context} context
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 */
exports.handler = async () => {
  return sendResponse({ data: null });
};
