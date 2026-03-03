import { createClient, type RedisClientType } from "redis";

export const redisClient: RedisClientType = createClient();

redisClient.on("error", (error) =>
  console.error("[Redis client error]", error),
);

export const connectRedisClient = async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
};

export const setNewToken = async (userId: string, token: string) => {
  const key = `token:${userId}`;
  await redisClient.del(key);
  await redisClient.setEx(key, 604800, token);
};

export const getToken = async (userId: string) => {
  const key = `token:${userId}`;
  return await redisClient.get(key);
};

export const deleteToken = async (userId: string) => {
  const key = `token:${userId}`;
  return await redisClient.del(key);
};
