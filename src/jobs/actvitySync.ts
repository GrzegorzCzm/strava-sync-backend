import { Container, Service } from 'typedi';
import { Logger } from 'winston';

import ClubController from '../controllers/clubController';

@Service()
export default class ActivitySync {
  clubCotrollerInstance;
  logger: Logger;
  delayInMs;
  constructor(delayInMs: number) {
    this.clubCotrollerInstance = Container.get(ClubController);
    this.logger = Container.get('logger');
    this.delayInMs = delayInMs;
  }

  start(): void {
    setInterval(() => {
      this.logger.info('Starting activity sync.');
      this.clubCotrollerInstance.syncActivities();
    }, this.delayInMs);
  }
}
