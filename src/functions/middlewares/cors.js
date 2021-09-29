/*global require exports  */
const { StatusCodes } = require("http-status-codes");
const { makeResponse } = require("../../utils/lambda");

/**
 * CORS Handler - options - /
 * @param {import("aws-lambda").APIGatewayProxyEvent} event
 * @param {import("aws-lambda").Context} context
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 */
exports.handler = async () => {
  return makeResponse({ data: null }, StatusCodes.OK);
};
