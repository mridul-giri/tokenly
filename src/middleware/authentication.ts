import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getToken } from "../redisService.js";
import type { JwtPayload } from "../utils/generateToken.js";
import type { TokenlyConfig } from "../core/tokenly.js";

const verifyToken = (
  authHeader: string,
  secret: string,
): Promise<JwtPayload> => {
  return new Promise((resolve, reject) => {
    const decodedToken = jwt.verify(authHeader, secret);
    resolve(decodedToken as JwtPayload);
  });
};

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name?: string;
    userName: string;
    email: string;
    password: string;
  };
}

export const authenticateToken =
  (config: TokenlyConfig) =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization!;
      if (!authHeader) {
        res.status(401).json({ message: "Unauthorized, Token not provided" });
        return;
      }

      const secret = process.env.JWT_SECRET!;

      const decodeToken = await verifyToken(authHeader, secret);
      if (!decodeToken.sub) {
        res.status(401).json({ message: "Token missing subject" });
      }
      const token = await getToken(decodeToken.sub, config.redis);
      if (!token || token != authHeader) {
        res
          .status(401)
          .json({ message: "Token expired or Invalid, Please login" });
        return;
      }

      const user = await config.adapter.findUserById(decodeToken.sub);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      req.user = user;
      next();
    } catch (error) {
      console.error("[Authentication Error]", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
