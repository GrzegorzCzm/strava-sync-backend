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
   *    tags:
   *      - name: club
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
   *    tags:
   *      - name: club
   *    description: Get club activities
   *    parameters:
   *      - name: type
   *        in: query
   *        description: Activity type. E.g. Run, Walk, etc...
   *        type: string
   *        required: false
   *        style: form
   *        schema:
   *          type: array
   *          items:
   *            type: string
   *        collectionFormat: multi
   *      - name: athlete
   *        in: query
   *        description: Athlete name
   *        style: form
   *        schema:
   *          type: array
   *          items:
   *            type: string
   *        collectionFormat: multi
   *        required: false
   *      - name: name
   *        in: query
   *        description: Activity name
   *        type: string
   *        required: false
   *        style: form
   *        schema:
   *          type: array
   *          items:
   *            type: string
   *        collectionFormat: multi
   *      - name: dateFrom
   *        in: query
   *        description: Activities which was created after this date. E.g 2020-01-01
   *        type: date
   *        required: false
   *      - name: dateTo
   *        in: query
   *        description: Activities which was created before or at this date. E.g. 2020-01-01
   *        type: date
   *        required: false
   *      - name: movingFrom
   *        in: query
   *        description: Activities which was >= duration given in seconds
   *        type: number
   *        required: false
   *      - name: movingTo
   *        in: query
   *        description: Activities which was <=  duration given in seconds
   *        type: number
   *        required: false
   *      - name: distanceFrom
   *        in: query
   *        description: Activities which was >= distance given in meters
   *        type: number
   *        required: false
   *      - name: distanceTo
   *        in: query
   *        description: Activities which was <=> given in meters
   *        type: number
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
