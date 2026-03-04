import type { NextFunction, Request, Response } from "express";
import type { RedisClientType } from "redis";

export const rateLimiter =
  (redis: RedisClientType, limit: number, windowSecond: number) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const key = `rate:${req.path}:${req.ip}`;
    try {
      const requests = await redis.incr(key);

      if (limit === requests) {
        await redis.expire(key, windowSecond);
      }

      if (requests > limit) {
        res
          .status(429)
          .json({ message: "Too many requests. Please try again later." });
        return;
      }

      next();
    } catch (error) {
      console.error("[Rate Limiter Error]", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
