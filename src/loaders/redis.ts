import redis from 'redis';
import { promisify } from 'util';

export default (): any => {
  const redisClient = redis.createClient({
    host: 'redis-server',
    port: 6379,
  });

  return {
    getAsync: promisify(redisClient.get).bind(redisClient),
    setAsync: promisify(redisClient.set).bind(redisClient),
  };
};
