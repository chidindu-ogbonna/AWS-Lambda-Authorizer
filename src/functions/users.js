/* global require exports console */

// Users Endpoints
const { StatusCodes } = require("http-status-codes");
const { sendResponse, parseBody, parseClaims } = require("../utils/lambda");

/**
 * Create user - post - /v1/users
 * @param {import("aws-lambda").APIGatewayProxyEvent} event
 */
exports.create = async (event) => {
  try {
    const body = parseBody(event);
    const claims = parseClaims(event);

    // Act on claims

    // Act on body

    return sendResponse({ data: { body, claims }, status: StatusCodes.OK });
  } catch (error) {
    console.error("Error: ", error);
    return sendResponse({ error });
  }
};
