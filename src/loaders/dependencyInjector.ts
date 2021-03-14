import { Container } from 'typedi';

interface DependencyInjectorProps {
  dynamoDbConnection;
  redisConnection;
  stravaConnection;
  logger;
}

export default ({
  dynamoDbConnection,
  redisConnection,
  stravaConnection,
  logger,
}: DependencyInjectorProps): void => {
  try {
    Container.set('dynamoDb', dynamoDbConnection);
    Container.set('redis', redisConnection);
    Container.set('strava', stravaConnection);
    Container.set('logger', logger);
  } catch (e) {
    logger.error('!!! Error on dependency injector loader: %o', e);
    throw e;
  }
};
