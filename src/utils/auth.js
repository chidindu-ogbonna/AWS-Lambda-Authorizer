/*global require exports Buffer */
const { promisify } = require("util");
const fetch = require("node-fetch");
const jwkToPem = require("jwk-to-pem");
const jsonwebtoken = require("jsonwebtoken");

/**
 * Grant API access to request
 * @param {object} h Request headers
 */
exports.grantAPIAccess = async (h) => {
  try {
    const cognitoIssuer = h["X-Cognito-Issuer"] || h["x-cognito-issuer"];
    const authorization = h["Authorization"] || h["authorization"];

    const token = authorization.split(" ")[1];
    const tokenSections = (token || "").split(".");
    if (tokenSections.length < 2) {
      throw AuthError("invalid_token", "Requested token is incomplete");
    }

    const headerJSON = Buffer.from(tokenSections[0], "base64").toString("utf8");
    const header = JSON.parse(headerJSON);
    const keys = await getPublicKeys(cognitoIssuer);
    const key = keys[header.kid];
    if (key === undefined) {
      throw AuthError("invalid_token", "Claim made for unknown kid");
    }

    const claim = await verifyPromised(token, key.pem);
    return { claim: JSON.stringify(claim) };
  } catch (error) {
    const message = `${error.name} - ${error.message}`;
    if (error.name === "TokenExpiredError")
      throw AuthError("expired_token", message);

    if (error.name === "JsonWebTokenError")
      throw AuthError("invalid_token", message);

    throw error;
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
exports.generatePolicy = function (
  principalId,
  effect,
  resource = "*",
  context = {}
) {
  const authResponse = {
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

  return authResponse;
};

const getPublicKeys = async (cognitoIssuer) => {
  const url = `${cognitoIssuer}/.well-known/jwks.json`;
  const response = await fetch(url, { method: "get" });
  const publicKeys = await response.json();

  return publicKeys.keys.reduce((total, currentValue) => {
    const pem = jwkToPem(currentValue);
    total[currentValue.kid] = { instance: currentValue, pem };
    return total;
  }, {});
};

const verifyPromised = promisify(jsonwebtoken.verify.bind(jsonwebtoken));

/**
 * Generate Auth Error
 * @param {('invalid_token'|'boye')} code Error message code
 * @param {string} message Message of the error
 * @returns
 */
const AuthError = (code, message) => {
  const error = new Error(message);
  error.name = "AuthError";
  error.code = `auth/${code}`;
  return error;
};
