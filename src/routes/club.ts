import { Router, Request, Response } from 'express';
import { Container } from 'typedi';
import { Logger } from 'winston';

import ClubController from '../controllers/clubController';

const route = Router();

export default (app: Router): void => {
  app.use('/club', route);

  /**
   * @swagger
   * /club/members:
   *  get:
   *    description: Get club members
   *    responses:
   *      200:
   *        description: Success
   */
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

  /**
   * @swagger
   * /club/activities:
   *  get:
   *    description: Get club activities
   *    parameters:
   *      - name: type
   *        in: query
   *        description: Activity type
   *        type: string
   *        required: false
   *    responses:
   *      200:
   *        description: Return club members sport activities.
   */
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
