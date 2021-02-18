import * as express from 'express';
import cors from 'cors';

import routes from '../routes';

export default async ({ app }: { app: express.Application }): Promise<express.Application> => {
  app.get('/status', (req, res) => {
    res.status(200).end();
  });
  app.head('/status', (req, res) => {
    res.status(200).end();
  });
  app.enable('trust proxy');
  app.use(cors());
  app.use('/', routes());

  return app;
};
