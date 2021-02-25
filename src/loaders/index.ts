import { Express } from 'express';

import logger from './logger';
import expressLoader from './express';
import dynamoDb from './dynamoDb';
import strava from './strava';
import jobsLoader from './jobs';
import dependencyInjectorLoader from './dependencyInjector';

export default async ({ expressApp }: { expressApp: Express }): Promise<void> => {
  const dynamoDbConnection = dynamoDb();
  const stravaConnection = await strava();

  await dependencyInjectorLoader({
    dynamoDbConnection,
    stravaConnection,
    logger,
  });
  logger.info('Dependency Injector loaded');

  jobsLoader();
  logger.info('Jobs started');

  await expressLoader({ app: expressApp });
  logger.info('Express Initialized');
};
