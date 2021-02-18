import { Router } from 'express';
import club from './club';

export default (): Router => {
  const app = Router();
  club(app);

  return app;
};
