/*global require exports */
const { generatePolicy, grantAPIAccess } = require("../../utils/auth");
const { logEvent } = require("../../utils/lambda");

/**
 * Middleware to control access to your API.
 *
 * @param {import('aws-lambda').APIGatewayAuthorizerEvent} event
 * @param {import('aws-lambda').APIGatewayAuthorizerWithContextHandler} context
 * @param {import('aws-lambda').APIGatewayAuthorizerCallback} callback
 * @returns {import('aws-lambda').APIGatewayAuthorizerResult}
 */
exports.handler = async (event, context, callback) => {
  try {
    const result = await grantAPIAccess(event.headers);
    return callback(null, generateAllowPolicy("client", result));
  } catch (error) {
    logEvent("error", error);
    return callback("Unauthorized");
  }
};

const generateAllowPolicy = (principalId, context = {}) => {
  return generatePolicy(principalId, "Allow", "*", context);
};
