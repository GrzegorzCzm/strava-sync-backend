import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

import club from './club';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Strava sync',
      version: '0.0.0',
    },
  },
  apis: ['./src/routes/*.ts'],
};

export default (): Router => {
  const app = Router();

  const swaggerSpec = swaggerJSDoc(options);
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(swaggerSpec));

  club(app);

  return app;
};
