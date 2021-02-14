import { Router, Request, Response } from 'express';
import { Container } from 'typedi';
import { Logger } from 'winston';

import StravaService from '../../services/stravaService';

const route = Router();

export default (app: Router): void => {
  app.use('/club', route);

  route.get('/members', async (req, res) => {
    const stravaServiceInstance = Container.get(StravaService);
    const logger: Logger = Container.get('logger');
    try {
      const stravaRes = await stravaServiceInstance.getClubMembers();
      res.send(stravaRes.data);
    } catch (error) {
      logger.error(error?.message);
    }
  });

  route.get('/lastactivities', async (req, res) => {
    const stravaServiceInstance = Container.get(StravaService);
    const logger: Logger = Container.get('logger');
    try {
      const stravaRes = await stravaServiceInstance.getClubActivities();
      res.send(stravaRes.data);
    } catch (error) {
      logger.error(error?.message);
    }
  });
};
