/*global require exports console Buffer*/
const {
  getUserClaim,
  AuthError,
  getPublicKeys,
  webTokenVerify,
} = require("../../utils/auth");

/**
 * Authorizer endpoint
 * @param {import('aws-lambda').APIGatewayAuthorizerEvent} event
 * @param {import('aws-lambda').APIGatewayAuthorizerWithContextHandler} context
 * @param {import('aws-lambda').APIGatewayAuthorizerCallback} callback
 * @returns {import('aws-lambda').APIGatewayAuthorizerResult}
 */
exports.handler = async (event, context, callback) => {
  const principalId = "client";

  try {
    const headers = event.headers;

    const response = await getUserClaim(headers);
    return callback(null, generatePolicy(principalId, "Allow", "*", response));
  } catch (error) {
    console.log("error", error);
    const denyErrors = ["auth/invalid_token", "auth/expired_token"];

    if (denyErrors.includes(error.code)) {
      // 401 Unauthorized
      return callback("Unauthorized");
    }

    // 403 Forbidden
    return callback(null, generatePolicy(principalId, "Deny"));
  }
};

/**
 * Generate IAM policy to access API
 * @param {string} principalId
 * @param {('Allow'|'Deny')} effect
 * @param {string} resouce The event.methodArn. Set as a default value of '*'.
 * This is a workaround to this [error](https://stackoverflow.com/questions/50331588/aws-api-gateway-custom-authorizer-strange-showing-error)
 * @param {object} context Addition information to add to application
 * @returns {import('aws-lambda').APIGatewayAuthorizerResult}
 */
const generatePolicy = function (
  principalId,
  effect,
  resource = "*",
  context = {}
) {
  const policy = {
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
    context, // Optional output with custom properties of the String, Number or Boolean type.
  };

  return policy;
};

/**
 * Grant API access to request
 * @param {object} h Request headers
 */
exports.getUserClaim = async (h) => {
  try {
    const authorization = h["Authorization"] || h["authorization"];

    const token = authorization.split(" ")[1];
    const tokenSections = (token || "").split(".");
    if (tokenSections.length < 2) {
      throw AuthError("invalid_token", "Requested token is incomplete");
    }

    const headerJSON = Buffer.from(tokenSections[0], "base64").toString("utf8");
    const header = JSON.parse(headerJSON);
    const keys = await getPublicKeys();
    const key = keys[header.kid];
    if (key === undefined) {
      throw AuthError("invalid_token", "Claim made for unknown kid");
    }

    const claims = await webTokenVerify(token, key.pem);
    return { claims: JSON.stringify(claims) };
  } catch (error) {
    const message = `${error.name} - ${error.message}`;
    if (error.name === "TokenExpiredError")
      throw AuthError("expired_token", message);

    if (error.name === "JsonWebTokenError")
      throw AuthError("invalid_token", message);

    throw error;
  }
};
