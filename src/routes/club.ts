import { Router, Request, Response } from 'express';
import { Container } from 'typedi';
import { Logger } from 'winston';

import ClubController from '../controllers/clubController';

const route = Router();

export default (app: Router): void => {
  app.use('/club', route);

  route.get('/members', async (req: Request, res: Response) => {
    const clubCotrollerInstance = Container.get(ClubController);
    const logger: Logger = Container.get('logger');
    try {
      const clubMembers = await clubCotrollerInstance.getClubMembers();
      res.send(clubMembers);
    } catch (error) {
      logger.error(error?.message);
    }
  });

  // Query e.g. http://localhost:3000/club/activities?keyA=valA
  route.get('/activities', async (req: Request, res: Response) => {
    const clubCotrollerInstance = Container.get(ClubController);
    const logger: Logger = Container.get('logger');
    try {
      const clubActivities = await clubCotrollerInstance.getClubActivities(req.query);
      res.send(clubActivities);
    } catch (error) {
      logger.error(error?.message);
    }
  });
};
