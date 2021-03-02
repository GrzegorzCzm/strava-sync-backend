import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';

import config from './config';
import Logger from './loaders/logger';

dotenv.config();

async function startServer() {
  const app = express();

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await require('./loaders').default({ expressApp: app });

  app
    .listen(config.server.PORT, () => {
      Logger.info(`Server listening on port: ${config.server.PORT}`);
    })
    .on('error', err => {
      Logger.error(err);
      process.exit(1);
    });
}

startServer();
