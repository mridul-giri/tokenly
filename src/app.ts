import express from "express";
import { Tokenly } from "./core/tokenly.js";
import { prismaAdapter } from "./adapters/prismaAdapter.js";
import { prisma } from "./lib/prisma.js";
import { dbConnect } from "./lib/mongo.js";
import { mongoDBAdapter } from "./adapters/mongoDBAdapter.js";
import UserModel from "./model/user.js";
import { createClient, type RedisClientType } from "redis";

// if using mongodb
// dbConnect();

const app = express();
app.use(express.json());

const redisClient: RedisClientType = createClient();

redisClient.on("error", (error) =>
  console.error("[Redis client error]", error),
);

(async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
})();

const auth = new Tokenly({
  adapter: prismaAdapter(prisma),
  // adapter: mongoDBAdapter(UserModel),
  redis: redisClient,
});

app.use("/api/v1/auth", auth.router());

app.listen(3000, () => console.log("Testing tokenly on port 3000"));
