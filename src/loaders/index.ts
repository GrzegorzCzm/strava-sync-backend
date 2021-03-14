import { Express } from 'express';

import logger from './logger';
import expressLoader from './express';
import dynamoDb from './dynamoDb';
import redis from './redis';
import strava from './strava';
import jobsLoader from './jobs';
import dependencyInjectorLoader from './dependencyInjector';

export default async ({ expressApp }: { expressApp: Express }): Promise<void> => {
  const dynamoDbConnection = dynamoDb();
  const redisConnection = redis();
  const stravaConnection = await strava();

  await dependencyInjectorLoader({
    dynamoDbConnection,
    redisConnection,
    stravaConnection,
    logger,
  });
  logger.info('Dependency Injector loaded');

  jobsLoader();
  logger.info('Jobs started');

  await expressLoader({ app: expressApp });
  logger.info('Express Initialized');
};
