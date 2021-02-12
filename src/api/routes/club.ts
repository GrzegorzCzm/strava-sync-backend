import { Router, Request, Response } from 'express';
import { Container } from 'typedi';
import { Logger } from 'winston';

import StravaService from '../../services/stravaService';

const route = Router();

export default (app: Router) => {
  app.use('/club', route);

  route.get('/members', (req, res) => {
    const stravaServiceInstance = Container.get(StravaService);
    const logger: Logger = Container.get('logger');
    stravaServiceInstance
      .getClubMembers()
      .then(stravaRes => {
        res.send(stravaRes.data);
      })
      .catch(error => {
        logger.error(error.message);
      });
  });

  route.get('/activities', (req, res) => {
    const stravaServiceInstance = Container.get(StravaService);
    const logger: Logger = Container.get('logger');
    stravaServiceInstance
      .getClubActivities()
      .then(stravaRes => {
        res.send(stravaRes.data);
      })
      .catch(error => {
        logger.error(error.message);
      });
  });
};
