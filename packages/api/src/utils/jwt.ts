import jwt from "jsonwebtoken";

const SECRET = "secret";

export const signToken = (payload: any) =>
  jwt.sign(payload, SECRET, { expiresIn: "1d" });

export const verifyToken = (token: string) =>
  jwt.verify(token, SECRET);