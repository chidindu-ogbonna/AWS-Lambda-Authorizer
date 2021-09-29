/* global require exports */

// Users Endpoints
const { StatusCodes } = require("http-status-codes");
const { UsersModel } = require("../services/db/models");
const { generateID } = require("../utils");
const {
  logEvent,
  makeResponse,
  hasRequiredFields,
} = require("../utils/lambda");

/**
 * Create user - post - /v1/users
 * @param {import("aws-lambda").APIGatewayProxyEvent} event
 * @param {import("aws-lambda").Context} context
 */
exports.create = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    hasRequiredFields(body, ["email", "username", "account_type"]);

    const user = await UsersModel.create({
      ...body,
      user_id: generateID(),
    });
    return makeResponse({ data: { user }, statusCode: StatusCodes.OK });
  } catch (error) {
    logEvent("error", error);
    return makeResponse({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error,
    });
  }
};

/**
 * List users - get - /v1/users
 * @param {import("aws-lambda").APIGatewayProxyEvent} event
 * @param {import("aws-lambda").Context} context
 */
exports.list = async (event, context) => {
  try {
    const { limit, start_at } = event.queryStringParameters || {};

    let query = UsersModel.scan();
    if (limit) query.limit(parseInt(limit));
    if (start_at) query.startAt(JSON.parse(start_at));

    const users = await query.exec();

    return makeResponse({
      data: { users, count: users.count },
      statusCode: StatusCodes.OK,
    });
  } catch (error) {
    logEvent("error", error);
    return makeResponse({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      error,
    });
  }
};
