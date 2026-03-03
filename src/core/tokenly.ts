import express, { Router } from "express";
import { login, signup } from "../controllers/userController.js";
import type { AuthAdapter } from "../interfaces/adapter.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

export type TokenlyConfig = {
  adapter: AuthAdapter;
};

export class Tokenly {
  constructor(private config: TokenlyConfig) {}

  router = (): Router => {
    const router = express.Router();

    router.post("/signup", rateLimiter(5, 30), signup(this.config));
    router.get("/login", rateLimiter(5, 30), login(this.config));

    return router;
  };
}
