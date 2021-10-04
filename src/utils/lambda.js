/* global exports */

/**
 * Parse claims from event request context
 * @param {import("aws-lambda").APIGatewayProxyEvent} event
 */
exports.parseClaims = (event) => {
  return JSON.parse(event.requestContext.authorizer.claims);
};

/**
 * Parse request body from event
 * @param {import("aws-lambda").APIGatewayProxyEvent} event
 */
exports.parseBody = (event) => JSON.parse(event.body);

/**
 * Helper function to generate response to send to client
 * @param {object} response
 * @param {object?} response.data data if any
 * @param {Error?} response.error error if any
 * @param {Number} response.status status code of the response
 */
exports.sendResponse = ({ data, error, status }) => {
  const Response = {
    statusCode: status ? status : error ? 500 : 200,
    headers: {
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Authorization, Accept, x-www-form-urlencoded, X-Cognito-Issuer, X-API-Key",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
    },
    body: null,
  };

  if (error) {
    Response.body = JSON.stringify({
      error: {
        message: error.message,
        name: error.name,
      },
    });
    return Response;
  }

  Response.body = JSON.stringify({ data });
  return Response;
};
