import jwt from "jsonwebtoken";
import type { DecodedToken } from "../types";

const SECRET = "secret";

export const signToken = (payload: DecodedToken) => jwt.sign(payload, SECRET, { expiresIn: "1d" });

export const verifyToken = (token: string) => jwt.verify(token, SECRET) as DecodedToken;
