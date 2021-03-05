import { Container } from 'typedi';

interface DependencyInjectorProps {
  dynamoDbConnection;
  stravaConnection;
  logger;
}

export default ({
  dynamoDbConnection,
  stravaConnection,
  logger,
}: DependencyInjectorProps): void => {
  try {
    Container.set('dynamoDb', dynamoDbConnection);
    Container.set('strava', stravaConnection);
    Container.set('logger', logger);
  } catch (e) {
    logger.error('!!! Error on dependency injector loader: %o', e);
    throw e;
  }
};
