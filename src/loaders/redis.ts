import redis from 'redis';
import { promisify } from 'util';

export default async (): Promise<Models.Redis> => {
  const redisClient = redis.createClient({
    host: 'redis-server',
    port: 6379,
  });

  const getAsync = promisify(redisClient.get).bind(redisClient);
  const setAsync = promisify(redisClient.set).bind(redisClient);
  const flushAllAsync = promisify(redisClient.flushall).bind(redisClient);

  await flushAllAsync();
  return {
    getAsync,
    setAsync,
    flushAllAsync,
  };
};
