/*global require exports process*/
const { promisify } = require("util");
const fetch = require("node-fetch");
const jwkToPem = require("jwk-to-pem");
const jsonwebtoken = require("jsonwebtoken");

exports.getPublicKeys = async () => {
  const issuer = `https://cognito-idp.${process.env.REGION}.amazonaws.com/${process.env.USER_POOL}`;
  const url = `${issuer}/.well-known/jwks.json`;
  const response = await fetch(url, { method: "get" });
  const publicKeys = await response.json();

  return publicKeys.keys.reduce((total, currentValue) => {
    const pem = jwkToPem(currentValue);
    total[currentValue.kid] = { instance: currentValue, pem };
    return total;
  }, {});
};

exports.webTokenVerify = promisify(jsonwebtoken.verify.bind(jsonwebtoken));

/**
 * Generate Auth Error
 * @param {('invalid_token'|'boye')} code Error message code
 * @param {string} message Message of the error
 * @returns
 */
exports.AuthError = (code, message) => {
  const error = new Error(message);
  error.name = "AuthError";
  error.code = `auth/${code}`;
  return error;
};
