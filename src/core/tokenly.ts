import express, { Router } from "express";
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

export type TokenlyConfig = {
  adapter: AuthAdapter;
};

export class Tokenly {
  constructor(private config: TokenlyConfig) {}

  router = (): Router => {
    const router = express.Router();

    router.post("/signup", rateLimiter(5, 30), signup(this.config));
    router.get("/login", rateLimiter(5, 30), login(this.config));
    router.patch(
      "/change-password",
      rateLimiter(5, 30),
      authenticateToken(this.config),
      changePassword(this.config),
    );
    router.post(
      "/logout",
      rateLimiter(5, 30),
      authenticateToken(this.config),
      logout(this.config),
    );
    router.delete(
      "/delete",
      rateLimiter(5, 30),
      authenticateToken(this.config),
      deleteUser(this.config),
    );
    router.get(
      "/me",
      rateLimiter(5, 30),
      authenticateToken(this.config),
      me(this.config),
    );

    return router;
  };
}
