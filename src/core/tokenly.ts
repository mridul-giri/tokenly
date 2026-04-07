import express from "express";
import {
  changePassword,
  deleteUser,
  login,
  logout,
  me,
  signup,
} from "../controllers/userController.js";
import type { AuthAdapter } from "../interfaces/adapter.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { authenticateToken } from "../middleware/authentication.js";
import type { RedisClientType } from "redis";

export type TokenlyConfig = {
  adapter: AuthAdapter;
  redis: RedisClientType;
};

export class Tokenly {
  constructor(private config: TokenlyConfig) {}

  router = (): any => {
    const router = express.Router();

    router.post(
      "/signup",
      rateLimiter(this.config.redis, 5, 30),
      signup(this.config),
    );
    router.post(
      "/login",
      rateLimiter(this.config.redis, 5, 30),
      login(this.config),
    );
    router.patch(
      "/change-password",
      rateLimiter(this.config.redis, 5, 30),
      authenticateToken(this.config),
      changePassword(this.config),
    );
    router.post(
      "/logout",
      rateLimiter(this.config.redis, 5, 30),
      authenticateToken(this.config),
      logout(this.config),
    );
    router.delete(
      "/delete",
      rateLimiter(this.config.redis, 5, 30),
      authenticateToken(this.config),
      deleteUser(this.config),
    );
    router.get(
      "/me",
      rateLimiter(this.config.redis, 5, 30),
      authenticateToken(this.config),
      me(this.config),
    );

    return router;
  };
}
