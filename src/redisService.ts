import type { RedisClientType } from "redis";

export const setNewToken = async (
  userId: string,
  token: string,
  redis: RedisClientType,
) => {
  const key = `token:${userId}`;
  await redis.del(key);
  await redis.setEx(key, 604800, token);
};

export const getToken = async (userId: string, redis: RedisClientType) => {
  const key = `token:${userId}`;
  return await redis.get(key);
};

export const deleteToken = async (userId: string, redis: RedisClientType) => {
  const key = `token:${userId}`;
  return await redis.del(key);
};
