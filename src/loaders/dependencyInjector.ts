import { Container } from 'typedi';

interface Model {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any;
}

interface DependencyInjectorProps {
  dynamoDbConnection;
  stravaConnection;
  logger;
  models: Model[];
}

export default ({
  dynamoDbConnection,
  stravaConnection,
  logger,
  models,
}: DependencyInjectorProps): void => {
  try {
    Container.set('dynamoDb', dynamoDbConnection);
    Container.set('strava', stravaConnection);
    Container.set('logger', logger);

    models.forEach(m => {
      Container.set(m.name, m.model);
    });
  } catch (e) {
    logger.error('Error on dependency injector loader: %o', e);
    throw e;
  }
};
