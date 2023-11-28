var jwt = require("jsonwebtoken");
require("dotenv").config();

export function signToken(payload: any) {
  const token = jwt.sign(payload, process.env.JWT_SECRET!);
  return token;
}

/**
 * either returns {error} or decoded jwt
 */
export function verifyToken(payload: string) {
  return jwt.verify(payload, process.env.JWT_SECRET!);
}

export function decodeJwt(token: any) {
  return jwt.decode(token);
}
