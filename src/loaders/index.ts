import expressLoader from './express';
import dynamoDb from './dynamoDb';
import strava from './strava';
import dependencyInjectorLoader from './dependencyInjector';
import logger from './logger';

export default async ({ expressApp }) => {
  const dynamoDbConnection = dynamoDb();
  const stravaConnection = strava();

  await dependencyInjectorLoader({
    dynamoDbConnection,
    stravaConnection,
    logger,
    models: [
      //some models here
    ],
  });
  logger.info('Dependency Injector loaded');

  await expressLoader({ app: expressApp });
  logger.info('Express Initialized');
};
