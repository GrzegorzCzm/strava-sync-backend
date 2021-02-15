import { Express } from 'express';

import logger from './logger';
import expressLoader from './express';
import dynamoDb from './dynamoDb';
import strava from './strava';
import dependencyInjectorLoader from './dependencyInjector';

export default async ({ expressApp }: { expressApp: Express }): Promise<void> => {
  const dynamoDbConnection = dynamoDb();
  const stravaConnection = await strava();

  await dependencyInjectorLoader({
    dynamoDbConnection,
    stravaConnection,
    logger,
    models: [
      //TODO some models here
    ],
  });
  logger.info('Dependency Injector loaded');

  await expressLoader({ app: expressApp });
  logger.info('Express Initialized');
};
